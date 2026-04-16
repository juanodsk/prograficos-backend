import { prisma } from "../config/db.js";
import { buildActiveWhere, normalizeIsActive } from "../utils/active.js";
import {
  buildInsensitiveContains,
  buildPaginationMeta,
  parsePagination,
  parseSort,
} from "../utils/pagination.js";

const productInclude = {
  troquel: {
    select: {
      id: true,
      code: true,
      size: true,
      file_name: true,
      elaboration_date: true,
    },
  },
  third: {
    select: {
      id: true,
      name: true,
      company_name: true,
      type_person: true,
      document_number: true,
      email: true,
    },
  },
};

const buildProductSearchWhere = (rawSearch) => {
  const search = rawSearch?.trim();

  if (!search) {
    return {};
  }

  const numericSearch = Number.parseInt(search, 10);
  const normalizedSearch = search.toLowerCase();
  const or = [
    { name: buildInsensitiveContains(search) },
    {
      third: {
        is: {
          name: buildInsensitiveContains(search),
        },
      },
    },
    {
      third: {
        is: {
          company_name: buildInsensitiveContains(search),
        },
      },
    },
    {
      troquel: {
        is: {
          code: buildInsensitiveContains(search),
        },
      },
    },
    {
      troquel: {
        is: {
          file_name: buildInsensitiveContains(search),
        },
      },
    },
  ];

  if (!Number.isNaN(numericSearch)) {
    or.push({ id: numericSearch });
    or.push({ troquel_id: numericSearch });
    or.push({ third_id: numericSearch });
  }

  if ("active".includes(normalizedSearch) || "activo".includes(normalizedSearch)) {
    or.push({ is_active: true });
  }

  if ("inactive".includes(normalizedSearch) || "inactivo".includes(normalizedSearch)) {
    or.push({ is_active: false });
  }

  return { OR: or };
};

const buildProductCustomerWhere = (rawCustomer) => {
  const customer = rawCustomer?.trim();

  if (!customer) {
    return {};
  }

  return {
    third: {
      is: {
        OR: [
          { name: buildInsensitiveContains(customer) },
          { company_name: buildInsensitiveContains(customer) },
        ],
      },
    },
  };
};

const productSortMap = {
  id: (direction) => [{ id: direction }],
  name: (direction) => [{ name: direction }],
  third: (direction) => [{ third: { name: direction } }, { id: "asc" }],
  troquel: (direction) => [{ troquel: { code: direction } }, { id: "asc" }],
  is_active: (direction) => [{ is_active: direction }, { id: "asc" }],
};

const normalizeProductPayload = (body, currentIsActive = true) => ({
  name: body?.name?.trim() ? body.name.trim() : null,
  troquel_id: body?.troquel_id != null ? Number(body.troquel_id) : NaN,
  third_id: body?.third_id != null ? Number(body.third_id) : NaN,
  is_active: normalizeIsActive(body?.is_active, currentIsActive),
});

const validateProductPayload = async (payload, currentProductId = null) => {
  if (Number.isNaN(payload.troquel_id)) {
    return "Debes seleccionar un troquel";
  }

  if (Number.isNaN(payload.third_id)) {
    return "Debes seleccionar un tercero";
  }

  const [troquel, third, duplicate] = await Promise.all([
    prisma.troqueles.findFirst({
      where: {
        id: payload.troquel_id,
        is_active: true,
      },
    }),
    prisma.thirds.findFirst({
      where: {
        id: payload.third_id,
        is_active: true,
      },
    }),
    prisma.product.findFirst({
      where: {
        troquel_id: payload.troquel_id,
        third_id: payload.third_id,
        ...(currentProductId ? { NOT: { id: currentProductId } } : {}),
      },
    }),
  ]);

  if (!troquel) {
    return "El troquel seleccionado no existe o está inactivo";
  }

  if (!third) {
    return "El tercero seleccionado no existe o está inactivo";
  }

  if (duplicate) {
    return "Este troquel ya está asignado al tercero seleccionado";
  }

  return null;
};

const createProduct = async (req, res) => {
  try {
    const payload = normalizeProductPayload(req.body);
    const validationError = await validateProductPayload(payload);

    if (validationError) {
      return res.status(400).json({
        status: "error",
        message: validationError,
      });
    }

    const product = await prisma.product.create({
      data: payload,
      include: productInclude,
    });

    res.status(201).json({
      status: "success",
      message: "Producto creado exitosamente",
      data: { product },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "Error al crear el producto",
    });
  }
};

const getProduct = async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    const product = await prisma.product.findUnique({
      where: { id },
      include: productInclude,
    });

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Producto no encontrado",
      });
    }

    res.status(200).json({
      status: "success",
      data: { product },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error al obtener el producto",
    });
  }
};

const getProducts = async (req, res) => {
  try {
    const { page: requestedPage, pageSize } = parsePagination(req.query, {
      maxPageSize: 1000,
    });
    const { sortBy, sortDirection } = parseSort(req.query, {
      allowedSortBy: Object.keys(productSortMap),
      fallbackSortBy: "third",
      fallbackSortDirection: "asc",
    });
    const filters = [
      buildProductSearchWhere(req.query?.search),
      buildProductCustomerWhere(req.query?.customer),
    ].filter((filter) => Object.keys(filter).length > 0);
    const where = buildActiveWhere(
      req.query,
      filters.length > 0 ? { AND: filters } : {},
    );
    const total = await prisma.product.count({ where });
    const meta = buildPaginationMeta(requestedPage, pageSize, total);

    const products = await prisma.product.findMany({
      where,
      include: productInclude,
      orderBy: productSortMap[sortBy](sortDirection),
      skip: (meta.page - 1) * meta.pageSize,
      take: meta.pageSize,
    });

    res.status(200).json({
      status: "success",
      data: { products },
      meta,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "Error al obtener los productos",
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return res.status(404).json({
        status: "error",
        message: "Producto no encontrado",
      });
    }

    const payload = normalizeProductPayload(req.body, existingProduct.is_active);
    const validationError = await validateProductPayload(payload, id);

    if (validationError) {
      return res.status(400).json({
        status: "error",
        message: validationError,
      });
    }

    const product = await prisma.product.update({
      where: { id },
      data: payload,
      include: productInclude,
    });

    res.status(200).json({
      status: "success",
      message: "Producto actualizado exitosamente",
      data: { product },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "Error al actualizar el producto",
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return res.status(404).json({
        status: "error",
        message: "Producto no encontrado",
      });
    }

    await prisma.product.update({
      where: { id },
      data: { is_active: false },
    });

    res.status(200).json({
      status: "success",
      message: "Producto desactivado exitosamente",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error al desactivar el producto",
    });
  }
};

export { createProduct, getProduct, getProducts, updateProduct, deleteProduct };
