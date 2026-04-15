import { prisma } from "../config/db.js";
import { buildActiveWhere, normalizeIsActive } from "../utils/active.js";
import {
  buildInsensitiveContains,
  buildPaginationMeta,
  parsePagination,
} from "../utils/pagination.js";

const paperTypeInclude = {
  suppliers: {
    include: {
      third: {
        select: {
          id: true,
          name: true,
          company_name: true,
          email: true,
          type_person: true,
          is_active: true,
        },
      },
    },
    orderBy: { id: "asc" },
  },
};

const normalizeSupplierInput = (supplier) => ({
  third_id:
    supplier?.third_id != null && supplier.third_id !== ""
      ? Number(supplier.third_id)
      : null,
  purchase_price:
    supplier?.purchase_price != null && supplier.purchase_price !== ""
      ? Number(supplier.purchase_price)
      : supplier?.price != null && supplier.price !== ""
        ? Number(supplier.price)
        : null,
});

const buildPaperTypeSearchWhere = (rawSearch) => {
  const search = rawSearch?.trim();

  if (!search) {
    return {};
  }

  const numericSearch = Number.parseInt(search, 10);
  const grammageSearch = Number(search);
  const or = [
    { name: buildInsensitiveContains(search) },
    { description: buildInsensitiveContains(search) },
    {
      suppliers: {
        some: {
          third: {
            is: {
              OR: [
                { name: buildInsensitiveContains(search) },
                { company_name: buildInsensitiveContains(search) },
                { email: buildInsensitiveContains(search) },
              ],
            },
          },
        },
      },
    },
  ];

  if (!Number.isNaN(numericSearch)) {
    or.push({ id: numericSearch });
  }

  if (!Number.isNaN(grammageSearch)) {
    or.push({ grammage: grammageSearch });
  }

  return { OR: or };
};

const validatePaperTypePayload = async ({
  name,
  description,
  grammage,
  suppliers,
}) => {
  const normalizedName = name?.trim();
  const normalizedDescription = description?.trim();
  const normalizedGrammage = Number(grammage);
  const normalizedSuppliers = Array.isArray(suppliers)
    ? suppliers.map(normalizeSupplierInput)
    : [];

  if (!normalizedName) {
    return { error: "El nombre es obligatorio" };
  }

  if (!normalizedDescription) {
    return { error: "La descripcion es obligatoria" };
  }

  if (Number.isNaN(normalizedGrammage) || normalizedGrammage <= 0) {
    return {
      error: "El gramaje es obligatorio y debe ser mayor a 0",
    };
  }

  if (!normalizedSuppliers.length) {
    return {
      error: "Debes asociar al menos un proveedor al tipo de papel",
    };
  }

  const seenThirdIds = new Set();

  for (const supplier of normalizedSuppliers) {
    if (supplier.third_id == null || Number.isNaN(supplier.third_id)) {
      return {
        error: "Uno de los proveedores asociados no es valido",
      };
    }

    if (seenThirdIds.has(supplier.third_id)) {
      return {
        error: "No puedes repetir el mismo proveedor en el tipo de papel",
      };
    }

    seenThirdIds.add(supplier.third_id);

    if (
      supplier.purchase_price == null ||
      Number.isNaN(supplier.purchase_price) ||
      supplier.purchase_price <= 0
    ) {
      return {
        error:
          "Todos los proveedores deben tener un precio de compra mayor a 0",
      };
    }
  }

  const providerIds = normalizedSuppliers.map((supplier) => supplier.third_id);
  const providers = await prisma.thirds.findMany({
    where: {
      id: { in: providerIds },
      is_active: true,
      type_person: "PROVEEDOR",
    },
    select: { id: true },
  });

  if (providers.length !== providerIds.length) {
    return {
      error:
        "Uno o varios proveedores no existen, estan inactivos o no son de tipo PROVEEDOR",
    };
  }

  return {
    data: {
      name: normalizedName,
      description: normalizedDescription,
      grammage: normalizedGrammage,
      suppliers: normalizedSuppliers,
    },
  };
};

const createPaperType = async (req, res) => {
  try {
    const { name, description, grammage, is_active, suppliers } = req.body;
    const validation = await validatePaperTypePayload({
      name,
      description,
      grammage,
      suppliers,
    });

    if (validation.error) {
      return res.status(400).json({
        status: "error",
        message: validation.error,
      });
    }

    const { data } = validation;

    const duplicatePaperType = await prisma.paper_Type.findFirst({
      where: {
        name: data.name,
        description: data.description,
        grammage: data.grammage,
      },
    });

    if (duplicatePaperType) {
      return res.status(400).json({
        status: "error",
        message:
          "Ya existe un tipo de papel con ese nombre, descripcion y gramaje",
        data: duplicatePaperType,
      });
    }

    const paperType = await prisma.paper_Type.create({
      data: {
        name: data.name,
        description: data.description,
        grammage: data.grammage,
        is_active: normalizeIsActive(is_active, true),
        suppliers: {
          create: data.suppliers.map((supplier) => ({
            third_id: supplier.third_id,
            purchase_price: supplier.purchase_price,
          })),
        },
      },
      include: paperTypeInclude,
    });

    res.status(201).json({
      status: "success",
      message: "Tipo de papel creado exitosamente",
      data: paperType,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "Error al crear el tipo de papel",
    });
  }
};

const getPaperType = async (req, res) => {
  try {
    const { page: requestedPage, pageSize } = parsePagination(req.query);
    const where = buildActiveWhere(
      req.query,
      buildPaperTypeSearchWhere(req.query?.search),
    );
    const total = await prisma.paper_Type.count({ where });
    const meta = buildPaginationMeta(requestedPage, pageSize, total);

    const paperTypes = await prisma.paper_Type.findMany({
      where,
      include: paperTypeInclude,
      orderBy: { name: "asc" },
      skip: (meta.page - 1) * meta.pageSize,
      take: meta.pageSize,
    });
    res.status(200).json({
      status: "success",
      message: "Tipos de papel obtenidos exitosamente",
      data: paperTypes,
      meta,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error al obtener los tipos de papel",
    });
  }
};

const getPaperTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    const paperType = await prisma.paper_Type.findUnique({
      where: {
        id: parseInt(id, 10),
      },
      include: paperTypeInclude,
    });
    if (!paperType) {
      return res.status(404).json({
        status: "error",
        message: "Tipo de papel no encontrado",
      });
    }
    res.status(200).json({
      status: "success",
      message: "Tipo de papel obtenido exitosamente",
      data: paperType,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error al obtener el tipo de papel",
    });
  }
};

const updatePaperType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, grammage, is_active, suppliers } = req.body;
    const paperTypeId = parseInt(id, 10);

    const paperTypeExists = await prisma.paper_Type.findUnique({
      where: { id: paperTypeId },
      select: { id: true, is_active: true },
    });

    if (!paperTypeExists) {
      return res.status(404).json({
        status: "error",
        message: "Tipo de papel no encontrado",
      });
    }

    const validation = await validatePaperTypePayload({
      name,
      description,
      grammage,
      suppliers,
    });

    if (validation.error) {
      return res.status(400).json({
        status: "error",
        message: validation.error,
      });
    }

    const { data } = validation;

    const duplicatePaperType = await prisma.paper_Type.findFirst({
      where: {
        id: { not: paperTypeId },
        name: data.name,
        description: data.description,
        grammage: data.grammage,
      },
    });

    if (duplicatePaperType) {
      return res.status(400).json({
        status: "error",
        message:
          "Ya existe un tipo de papel con ese nombre, descripcion y gramaje",
        data: duplicatePaperType,
      });
    }

    const paperType = await prisma.$transaction(async (tx) => {
      await tx.paper_Type.update({
        where: {
          id: paperTypeId,
        },
        data: {
          name: data.name,
          description: data.description,
          grammage: data.grammage,
          is_active: normalizeIsActive(is_active, paperTypeExists.is_active),
        },
      });

      await tx.paperTypeSupplier.deleteMany({
        where: { paper_type_id: paperTypeId },
      });

      await tx.paperTypeSupplier.createMany({
        data: data.suppliers.map((supplier) => ({
          paper_type_id: paperTypeId,
          third_id: supplier.third_id,
          purchase_price: supplier.purchase_price,
        })),
      });

      return tx.paper_Type.findUnique({
        where: { id: paperTypeId },
        include: paperTypeInclude,
      });
    });

    res.status(200).json({
      status: "success",
      message: "Tipo de papel actualizado exitosamente",
      data: paperType,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error al actualizar el tipo de papel",
    });
  }
};

const deletePaperType = async (req, res) => {
  try {
    const { id } = req.params;
    const paperTypeExists = await prisma.paper_Type.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!paperTypeExists) {
      return res.status(404).json({
        status: "error",
        message: "Tipo de papel no encontrado",
      });
    }

    await prisma.paper_Type.update({
      where: { id: parseInt(id, 10) },
      data: { is_active: false },
    });

    res.status(200).json({
      status: "success",
      message: "Tipo de papel desactivado exitosamente",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al desactivar el tipo de papel" });
  }
};

export {
  createPaperType,
  getPaperType,
  getPaperTypeById,
  updatePaperType,
  deletePaperType,
};
