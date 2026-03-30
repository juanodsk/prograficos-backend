import { prisma } from "../config/db.js";
import { buildActiveWhere, normalizeIsActive } from "../utils/active.js";

const createProductCustomer = async (req, res) => {
  try {
    const { name, product_id, third_id, is_active } = req.body;
    const thirdExists = await prisma.thirds.findFirst({
      where: {
        id: third_id,
        is_active: true,
      },
    });
    const productExists = await prisma.product.findFirst({
      where: {
        id: product_id,
        is_active: true,
      },
    });
    if (!thirdExists) {
      return res.status(404).json({
        status: "error",
        message: "El tercero no existe o está inactivo",
      });
    }
    if (!productExists) {
      return res.status(404).json({
        status: "error",
        message: "El producto no existe o está inactivo",
      });
    }

    const productCustomer = await prisma.product_Customer.create({
      data: {
        name,
        product_id,
        third_id,
        is_active: normalizeIsActive(is_active, true),
      },
    });
    res.status(201).json({
      status: "success",
      message: "Producto del cliente creado exitosamente",
      data: productCustomer,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "Error al crear Producto del cliente ",
    });
  }
};
const getProductCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const productCustomer = await prisma.product_Customer.findUnique({
      where: { id: parseInt(id) },
    });
    if (!productCustomer) {
      return res
        .status(404)
        .json({
          status: "error",
          message: "Producto del cliente no encontrado",
        });
    }
    res.status(200).json({
      status: "success",
      message: "Producto del cliente encontrado exitosamente",
      data: productCustomer,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "Error al obtener Producto del cliente",
    });
  }
};
const getProductCustomers = async (req, res) => {
  try {
    const productCustomers = await prisma.product_Customer.findMany({
      where: buildActiveWhere(req.query),
      orderBy: { name: "asc" },
    });
    res.status(200).json({
      status: "success",
      message: "Productos de clientes obtenidos exitosamente",
      data: productCustomers,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "Error al obtener Productos de clientes",
    });
  }
};
const updateProductCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, product_id, third_id, is_active } = req.body;
    const existingProductCustomer = await prisma.product_Customer.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingProductCustomer) {
      return res.status(404).json({
        status: "error",
        message: "Producto del cliente no encontrado",
      });
    }

    const thirdExists = await prisma.thirds.findFirst({
      where: {
        id: third_id,
        is_active: true,
      },
    });
    const productExists = await prisma.product.findFirst({
      where: {
        id: product_id,
        is_active: true,
      },
    });
    if (!thirdExists) {
      return res.status(404).json({
        status: "error",
        message: "El tercero no existe o está inactivo",
      });
    }
    if (!productExists) {
      return res.status(404).json({
        status: "error",
        message: "El producto no existe o está inactivo",
      });
    }
    const productCustomer = await prisma.product_Customer.update({
      where: { id: parseInt(id) },
      data: {
        name,
        product_id,
        third_id,
        is_active: normalizeIsActive(is_active, existingProductCustomer.is_active),
      },
    });
    res.status(200).json({
      status: "success",
      message: "Producto del cliente actualizado exitosamente",
      data: productCustomer,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error al actualizar Producto del cliente",
    });
  }
};
const deleteProductCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const existingProductCustomer = await prisma.product_Customer.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingProductCustomer) {
      return res.status(404).json({
        status: "error",
        message: "Producto del cliente no encontrado",
      });
    }

    const productCustomer = await prisma.product_Customer.update({
      where: { id: parseInt(id) },
      data: { is_active: false },
    });
    res.status(200).json({
      status: "success",
      message: "Producto de cliente desactivado exitosamente",
      data: productCustomer,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error al desactivar Producto de cliente",
    });
  }
};

export {
  createProductCustomer,
  getProductCustomer,
  getProductCustomers,
  updateProductCustomer,
  deleteProductCustomer,
};
