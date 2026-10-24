import mongoose from "mongoose";
import { prisma } from "../../config/db.js";
import { parsePagination, buildPaginationMeta } from "../../utils/pagination.js";
import { Quotation, QUOTE_STATUS } from "./quotation.model.js";
import { getNextQuoteNumber } from "./quotation.numbering.js";
import { calculateOffsetQuotation } from "./quotation.costing.js";
import { validateQuotationPayload } from "./quotation.validation.js";

// Vigencia de una cotización (constante por ahora, no parámetro del sistema).
const VALIDITY_DAYS = 15;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Lean docs traen _id (ObjectId) y __v: los normalizamos al contrato del módulo.
const serializeLean = (doc) => {
  if (!doc) return doc;
  const { _id, __v, ...rest } = doc;
  return { id: _id?.toString?.() ?? _id, ...rest };
};

// Expiración PEREZOSA: una cotización vencida (fecha + 15 días) que seguía en
// BORRADOR/ENVIADA se refleja como VENCIDA al leerla, sin un job de fondo.
const applyLazyExpiry = (doc) => {
  if (!doc || !doc.validoHasta) return doc;
  const stillOpen =
    doc.status === QUOTE_STATUS.BORRADOR || doc.status === QUOTE_STATUS.ENVIADA;
  if (stillOpen && new Date(doc.validoHasta) < new Date()) {
    return { ...doc, status: QUOTE_STATUS.VENCIDA };
  }
  return doc;
};

// Solo guarda los campos del costing CONGELADO (sin el margen: % ni ganancia).
const pickCosting = (c) => ({
  unidadesPorPliego: c.unidadesPorPliego,
  pliegos: c.pliegos,
  millares: c.millares,
  baseImpresion: c.baseImpresion,
  precioPlancha: c.precioPlancha,
  precioPliegos: c.precioPliegos,
  precioPlanchas: c.precioPlanchas,
  precioImpresion: c.precioImpresion,
  costosFijos: c.costosFijos,
  troquelado: c.troquelado,
  plastificado: c.plastificado,
  costosManuales: c.costosManuales,
  subtotalCostos: c.subtotalCostos,
  totalCotizar: c.totalCotizar,
  valorUnitario: c.valorUnitario,
});

// ─── Resolución contra Postgres (solo lectura; se congela en snapshots) ───

const resolveServiceLine = async (serviceLineId) => {
  const line = await prisma.serviceLine.findFirst({
    where: { id: serviceLineId, is_active: true },
    select: { id: true, name: true },
  });
  if (!line) {
    return { error: "La línea de servicio no existe o está inactiva" };
  }
  return { data: { id: line.id, name: line.name } };
};

const resolveClient = async (client) => {
  if (client.kind === "PROSPECT") {
    return { data: { kind: "PROSPECT", thirdId: null, contact: client.contact } };
  }

  const third = await prisma.thirds.findFirst({
    where: { id: client.thirdId, is_active: true, type_person: "CLIENTE" },
    select: {
      id: true,
      name: true,
      company_name: true,
      document_type: true,
      document_number: true,
      email: true,
      prefix: true,
    },
  });
  if (!third) {
    return { error: "El cliente no existe, está inactivo o no es de tipo CLIENTE" };
  }

  return {
    data: {
      kind: "EXISTING",
      thirdId: third.id,
      snapshot: {
        name: third.name,
        companyName: third.company_name,
        documentType: third.document_type,
        documentNumber: third.document_number,
        email: third.email,
        prefix: third.prefix,
      },
    },
  };
};

// Resuelve un ítem: valida papel/proveedor/formato/medida, corre el motor de
// costeo y devuelve el sub-documento congelado listo para guardar.
const resolveItem = async (item, serviceLineId) => {
  const paper = await prisma.paper_Type.findFirst({
    where: {
      id: item.paperTypeId,
      is_active: true,
      service_line_id: serviceLineId,
    },
    include: {
      suppliers: {
        include: {
          third: { select: { id: true, name: true, company_name: true } },
        },
      },
    },
  });
  if (!paper) {
    return {
      error: "el papel no existe, está inactivo o no pertenece a la línea",
    };
  }

  const supplier = paper.suppliers.find((s) => s.third_id === item.supplierThirdId);
  if (!supplier) {
    return { error: "el proveedor del papel no es válido" };
  }
  const precioPapel = Number(supplier.purchase_price);

  const format = await prisma.format.findFirst({
    where: { id: item.formatId, is_active: true },
    select: { id: true, name: true, sheet_divisions: true },
  });
  if (!format) {
    return { error: "el formato no existe o está inactivo" };
  }

  let medida = null;
  if (item.measureId) {
    const measure = await prisma.measure.findFirst({
      where: { id: item.measureId, is_active: true },
      select: { id: true, width: true, height: true },
    });
    if (!measure) {
      return { error: "la medida no existe o está inactiva" };
    }
    medida = { measureId: measure.id, label: `${measure.width} x ${measure.height}` };
  }

  let result;
  try {
    result = calculateOffsetQuotation({
      cantidad: item.cantidad,
      divisiones: format.sheet_divisions,
      cavidad: item.cavidad,
      precioPapel,
      tintas: item.tintas,
      porcentajeGanancia: item.porcentajeGanancia,
      costos: item.costos,
    });
  } catch (error) {
    return { error: error.message };
  }

  const itemDoc = {
    descripcionProducto: item.descripcionProducto,
    cantidad: item.cantidad,
    cavidad: item.cavidad,
    tintas: item.tintas,
    papel: {
      paperTypeId: paper.id,
      name: paper.name,
      grammage: paper.grammage,
      supplierThirdId: supplier.third_id,
      supplierName: supplier.third?.company_name || supplier.third?.name || null,
      precioUnitario: precioPapel,
    },
    formato: {
      formatId: format.id,
      name: format.name,
      divisiones: format.sheet_divisions,
    },
    medida,
    costosManuales: item.costos,
    costing: pickCosting(result),
  };
  // Precio final al cliente: el ajustado por el usuario (negociación) o, si no
  // lo ajustó, el valor unitario sugerido por el motor.
  itemDoc.costing.valorUnitarioFinal =
    item.valorUnitarioFinal != null
      ? item.valorUnitarioFinal
      : itemDoc.costing.valorUnitario;
  return { itemDoc };
};

// Arma los ítems congelados (compartido por crear/editar).
const buildItems = async (items, serviceLineId) => {
  const built = [];
  for (let i = 0; i < items.length; i += 1) {
    const resolved = await resolveItem(items[i], serviceLineId);
    if (resolved.error) {
      return { error: `Producto ${i + 1}: ${resolved.error}` };
    }
    built.push(resolved.itemDoc);
  }
  return { items: built };
};

// ─────────────────────────── CRUD ───────────────────────────

export const createQuotation = async (payload, userId = null) => {
  const validation = validateQuotationPayload(payload);
  if (validation.error) return { error: validation.error };
  const data = validation.data;

  const serviceLine = await resolveServiceLine(data.serviceLineId);
  if (serviceLine.error) return { error: serviceLine.error };

  const client = await resolveClient(data.client);
  if (client.error) return { error: client.error };

  const built = await buildItems(data.items, data.serviceLineId);
  if (built.error) return { error: built.error };

  const granTotal = built.items.reduce(
    // Gran total a cobrar = Σ (valor unitario × cantidad) por producto.
    (acc, it) => acc + it.costing.valorUnitarioFinal * it.cantidad,
    0,
  );

  const year = new Date().getFullYear();
  const { quoteNumber, sequence } = await getNextQuoteNumber(year);
  const fecha = new Date();
  const validoHasta = new Date(fecha.getTime() + VALIDITY_DAYS * MS_PER_DAY);

  const doc = await Quotation.create({
    quoteNumber,
    year,
    sequence,
    serviceLine: serviceLine.data,
    client: client.data,
    items: built.items,
    granTotal,
    fecha,
    validoHasta,
    createdByUserId: userId ?? null,
  });

  return { data: doc.toJSON() };
};

export const listQuotations = async (query = {}) => {
  const { page, pageSize } = parsePagination(query);

  const filter = { isActive: true };
  if (query.status) filter.status = query.status;
  if (query.serviceLineId) filter["serviceLine.id"] = Number(query.serviceLineId);
  if (query.thirdId) filter["client.thirdId"] = Number(query.thirdId);

  const search = query.search?.trim();
  if (search) {
    const rx = new RegExp(escapeRegex(search), "i");
    filter.$or = [
      { quoteNumber: rx },
      { "client.snapshot.companyName": rx },
      { "client.snapshot.name": rx },
      { "client.contact.name": rx },
      { "items.descripcionProducto": rx },
    ];
  }

  const total = await Quotation.countDocuments(filter);
  const meta = buildPaginationMeta(page, pageSize, total);

  const docs = await Quotation.find(filter)
    .sort({ createdAt: -1 })
    .skip((meta.page - 1) * meta.pageSize)
    .limit(meta.pageSize)
    .lean();

  const data = docs.map((doc) => applyLazyExpiry(serializeLean(doc)));
  return { data, meta };
};

export const getQuotationById = async (id) => {
  if (!mongoose.isValidObjectId(id)) return null;
  const doc = await Quotation.findOne({ _id: id, isActive: true }).lean();
  if (!doc) return null;
  return applyLazyExpiry(serializeLean(doc));
};

export const updateQuotation = async (id, payload) => {
  if (!mongoose.isValidObjectId(id)) {
    return { error: "Cotización no encontrada", notFound: true };
  }
  const existing = await Quotation.findOne({ _id: id, isActive: true });
  if (!existing) {
    return { error: "Cotización no encontrada", notFound: true };
  }
  if (existing.status !== QUOTE_STATUS.BORRADOR) {
    return { error: "Solo se puede editar una cotización en borrador" };
  }

  const validation = validateQuotationPayload(payload);
  if (validation.error) return { error: validation.error };
  const data = validation.data;

  const serviceLine = await resolveServiceLine(data.serviceLineId);
  if (serviceLine.error) return { error: serviceLine.error };

  const client = await resolveClient(data.client);
  if (client.error) return { error: client.error };

  const built = await buildItems(data.items, data.serviceLineId);
  if (built.error) return { error: built.error };

  existing.serviceLine = serviceLine.data;
  existing.client = client.data;
  existing.items = built.items;
  existing.granTotal = built.items.reduce(
    // Gran total a cobrar = Σ (valor unitario × cantidad) por producto.
    (acc, it) => acc + it.costing.valorUnitarioFinal * it.cantidad,
    0,
  );
  await existing.save();

  return { data: existing.toJSON() };
};

export const deleteQuotation = async (id) => {
  if (!mongoose.isValidObjectId(id)) {
    return { error: "Cotización no encontrada", notFound: true };
  }
  const existing = await Quotation.findOne({ _id: id, isActive: true });
  if (!existing) {
    return { error: "Cotización no encontrada", notFound: true };
  }
  existing.isActive = false;
  await existing.save();
  return { data: { id: existing.id } };
};

// Pasar de BORRADOR a ENVIADA (acción explícita).
export const markQuotationAsSent = async (id) => {
  if (!mongoose.isValidObjectId(id)) {
    return { error: "Cotización no encontrada", notFound: true };
  }
  const existing = await Quotation.findOne({ _id: id, isActive: true });
  if (!existing) {
    return { error: "Cotización no encontrada", notFound: true };
  }
  if (existing.status !== QUOTE_STATUS.BORRADOR) {
    return { error: "Solo se puede enviar una cotización en borrador" };
  }
  existing.status = QUOTE_STATUS.ENVIADA;
  await existing.save();
  return { data: existing.toJSON() };
};
