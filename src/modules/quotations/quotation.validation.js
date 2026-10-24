// Validación de la forma del payload de cotización (sin tocar la BD).
// Devuelve { error } con el primer problema, o { data } ya normalizado.
// Las validaciones contra Postgres (existencia/actividad) viven en el servicio.

const toInt = (value) => Number.parseInt(value, 10);
const isPositiveInt = (value) => Number.isInteger(value) && value > 0;

const CLIENT_KINDS = ["EXISTING", "PROSPECT"];
const MAX_TINTAS = 4;

const validateClient = (client) => {
  if (!client || typeof client !== "object") return "El cliente es obligatorio";
  if (!CLIENT_KINDS.includes(client.kind)) {
    return "El tipo de cliente no es válido";
  }
  if (client.kind === "EXISTING") {
    if (!isPositiveInt(toInt(client.thirdId))) {
      return "Debes seleccionar un cliente existente válido";
    }
  } else if (!String(client.contact?.name || "").trim()) {
    return "El prospecto requiere al menos un nombre de contacto";
  }
  return null;
};

const validateItem = (item, index) => {
  const label = `Producto ${index + 1}`;
  if (!item || typeof item !== "object") return `${label}: datos inválidos`;
  if (!String(item.descripcionProducto || "").trim()) {
    return `${label}: la descripción es obligatoria`;
  }
  const cantidad = toInt(item.cantidad);
  if (!Number.isInteger(cantidad) || cantidad < 200) {
    return `${label}: la cantidad mínima es de 200 unidades`;
  }
  if (!isPositiveInt(toInt(item.cavidad))) {
    return `${label}: la cavidad debe ser mayor a 0`;
  }
  const tintas = toInt(item.tintas);
  if (!Number.isInteger(tintas) || tintas < 0 || tintas > MAX_TINTAS) {
    return `${label}: las tintas deben estar entre 0 y 4 (0 = sin impresión)`;
  }
  if (!isPositiveInt(toInt(item.paperTypeId))) {
    return `${label}: selecciona un papel`;
  }
  if (!isPositiveInt(toInt(item.supplierThirdId))) {
    return `${label}: selecciona el proveedor del papel`;
  }
  if (!isPositiveInt(toInt(item.formatId))) {
    return `${label}: selecciona un formato`;
  }
  if (!isPositiveInt(toInt(item.measureId))) {
    return `${label}: selecciona un tamaño`;
  }
  const pct = Number(item.porcentajeGanancia);
  if (!Number.isFinite(pct) || pct <= 0 || pct > 100) {
    return `${label}: la ganancia debe estar entre 1% y 100%`;
  }
  const costos = normalizeCostos(item.costos);
  const costosTotal = Object.values(costos).reduce((acc, v) => acc + v, 0);
  if (costosTotal <= 0) {
    return `${label}: los costos no pueden quedar todos en $0`;
  }
  // Precio final (negociación): opcional; si viene, entero > 0.
  if (item.valorUnitarioFinal != null && item.valorUnitarioFinal !== "") {
    const vuf = toInt(item.valorUnitarioFinal);
    if (!Number.isInteger(vuf) || vuf <= 0) {
      return `${label}: el valor unitario final no es válido`;
    }
  }
  return null;
};

const normalizeCostos = (costos = {}) => ({
  diseno: Number(costos.diseno) || 0,
  troquel: Number(costos.troquel) || 0,
  acabados: Number(costos.acabados) || 0,
  corte: Number(costos.corte) || 0,
  pegado: Number(costos.pegado) || 0,
  troqueladoMillar: Number(costos.troqueladoMillar) || 0,
  plastificadoMillar: Number(costos.plastificadoMillar) || 0,
});

const normalizeItem = (item) => ({
  descripcionProducto: String(item.descripcionProducto).trim(),
  cantidad: toInt(item.cantidad),
  cavidad: toInt(item.cavidad),
  tintas: toInt(item.tintas),
  paperTypeId: toInt(item.paperTypeId),
  supplierThirdId: toInt(item.supplierThirdId),
  formatId: toInt(item.formatId),
  measureId: item.measureId ? toInt(item.measureId) : null,
  porcentajeGanancia: Number(item.porcentajeGanancia),
  costos: normalizeCostos(item.costos),
  // null = usar el valor unitario sugerido (automático).
  valorUnitarioFinal:
    item.valorUnitarioFinal != null && item.valorUnitarioFinal !== ""
      ? toInt(item.valorUnitarioFinal)
      : null,
});

const normalizeClient = (client) => {
  if (client.kind === "EXISTING") {
    return { kind: "EXISTING", thirdId: toInt(client.thirdId) };
  }
  return {
    kind: "PROSPECT",
    contact: {
      // El nombre del prospecto se guarda SIEMPRE en mayúsculas.
      name: String(client.contact?.name || "").trim().toUpperCase() || null,
      company: String(client.contact?.company || "").trim() || null,
      email: String(client.contact?.email || "").trim() || null,
      phone: String(client.contact?.phone || "").trim() || null,
    },
  };
};

const normalizeQuotationPayload = (body) => ({
  serviceLineId: toInt(body.serviceLineId),
  client: normalizeClient(body.client),
  items: body.items.map(normalizeItem),
});

export const validateQuotationPayload = (body = {}) => {
  if (!isPositiveInt(toInt(body.serviceLineId))) {
    return { error: "Debes seleccionar una línea de servicio" };
  }

  const clientError = validateClient(body.client);
  if (clientError) return { error: clientError };

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return { error: "La cotización debe tener al menos un producto" };
  }

  for (let i = 0; i < body.items.length; i += 1) {
    const itemError = validateItem(body.items[i], i);
    if (itemError) return { error: itemError };
  }

  return { data: normalizeQuotationPayload(body) };
};
