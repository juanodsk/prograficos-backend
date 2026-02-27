import { prisma } from "../config/db.js";

const createProductCustomer = async (req, res) => {
  try {
    const { name, product_id, third_id } = req.body;
    const thirdExists = await prisma.thirds.findUnique({
      where: { id: third_id },
    });
    const productExists = await prisma.product.findUnique({
      where: { id: product_id },
    });
    if (!thirdExists) {
      return res.status(404).json({ error: "Tercero no existe!" });
    }
    if (!productExists) {
      return res.status(404).json({ error: "Producto no existe!" });
    }

    const productCustomer = await prisma.product_Customer.create({
      data: {
        name,
        product_id,
        third_id,
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
        .json({ error: "Producto del cliente no encontrado!" });
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
    const productCustomers = await prisma.product_Customer.findMany();
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
    const { name, product_id, third_id } = req.body;
    const thirdExists = await prisma.thirds.findUnique({
      where: { id: third_id },
    });
    const productExists = await prisma.product.findUnique({
      where: { id: product_id },
    });
    if (!thirdExists) {
      return res.status(404).json({ error: "Tercero no existe!" });
    }
    if (!productExists) {
      return res.status(404).json({ error: "Producto no existe!" });
    }
    const productCustomer = await prisma.product_Customer.update({
      where: { id: parseInt(id) },
      data: {
        name,
        product_id,
        third_id,
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
    const ordersCount = await prisma.header_Production_Order.count({
      where: { paper_type_id: parseInt(id) },
    });

    if (ordersCount > 0) {
      return res.status(400).json({
        status: "error",
        message: `No se puede eliminar, tiene ${ordersCount} órdenes de producción asociadas`,
      });
    }

    const productCustomer = await prisma.product_Customer.delete({
      where: { id: parseInt(id) },
    });
    res.status(200).json({
      status: "success",
      message: "Producto de cliente eliminado exitosamente",
      data: productCustomer,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error al eliminar Producto de cliente",
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
