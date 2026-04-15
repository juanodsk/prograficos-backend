import { prisma } from "../config/db.js";
import { buildActiveWhere, normalizeIsActive } from "../utils/active.js";
import {
  buildInsensitiveContains,
  buildPaginationMeta,
  parsePagination,
} from "../utils/pagination.js";

const buildProductSearchWhere = (rawSearch) => {
  const search = rawSearch?.trim();

  if (!search) {
    return {};
  }

  const numericSearch = Number.parseInt(search, 10);
  const normalizedSearch = search.toLowerCase();
  const or = [{ name: buildInsensitiveContains(search) }];

  if (!Number.isNaN(numericSearch)) {
    or.push({ id: numericSearch });
  }

  if ("activo".includes(normalizedSearch)) {
    or.push({ is_active: true });
  }

  if ("inactivo".includes(normalizedSearch)) {
    or.push({ is_active: false });
  }

  return { OR: or };
};

const createProduct = async (req, res) => {
  try {
    const { name, is_active } = req.body;

    const productExists = await prisma.product.findFirst({
      where: {
        name,
        is_active: true,
      },
    });

    if (productExists) {
      return res
        .status(400)
        .json({ message: "Ya existe un producto con este nombre" });
    }
    const product = await prisma.product.create({
      data: {
        name,
        is_active,
      },
    });
    res.status(201).json({
      status: "success",
      message: "Producto creado exitosamente",
      data: { product },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error al crear el producto",
    });
  }
};
const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: {
        id: parseInt(id),
      },
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
    const { page: requestedPage, pageSize } = parsePagination(req.query);
    const where = buildActiveWhere(req.query, buildProductSearchWhere(req.query?.search));
    const total = await prisma.product.count({ where });
    const meta = buildPaginationMeta(requestedPage, pageSize, total);

    const products = await prisma.product.findMany({
      where,
      orderBy: { name: "asc" },
      skip: (meta.page - 1) * meta.pageSize,
      take: meta.pageSize,
    });
    res.status(200).json({
      status: "success",
      data: { products },
      meta,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error al obtener los productos",
    });
  }
};
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, is_active } = req.body;
    const productExists = await prisma.product.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!productExists) {
      return res.status(404).json({
        status: "error",
        message: "Producto no encontrado",
      });
    }

    const product = await prisma.product.update({
      where: {
        id: parseInt(id),
      },
      data: {
        name,
        is_active,
      },
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
    const { id } = req.params;
    const productExists = await prisma.product.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!productExists) {
      return res.status(404).json({
        status: "error",
        message: "Producto no encontrado",
      });
    }

    await prisma.product.update({
      where: {
        id: parseInt(id),
      },
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
