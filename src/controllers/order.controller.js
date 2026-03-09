import { prisma } from "../config/db.js";

const createOrder = async (req, res) => {
  try {
    const {
      date_delivery_estimated,
      amount_sheets,
      total_estimated,
      measure_id,
      paper_type_id,
      troquel_id,
      product_customer_id,
      processes,
    } = req.body;

    if (!processes || processes.length === 0) {
      return res.status(400).json({
        message: "Debes seleccionar al menos un proceso",
      });
    }
    const order = await prisma.header_Production_Order.create({
      data: {
        date_delivery_estimated: new Date(date_delivery_estimated),
        amount_sheets,
        total_estimated,
        measure_id,
        paper_type_id,
        troquel_id,
        product_customer_id,

        // 👇 Usuario que crea la orden
        user_id: req.user.id,

        // Crear procesos en estado PENDIENTE
        detail_production_orders: {
          create: processes.map((processId) => ({
            process_id: processId,
            quantity_delivered: 0,
            quantity_damaged: 0,
          })),
        },
      },
      include: {
        detail_production_orders: true,
      },
    });
    res.status(201).json({
      status: "success",
      message: "Orden creada exitosamente",
      data: order,
    });
  } catch (error) {
    console.log(error);
  }
};
const getOrders = async (req, res) => {
  try {
    const orders = await prisma.header_Production_Order.findMany({
      include: {
        product_customer: {
          include: {
            third: true,
            product: true,
          },
        },
        measure: true,
        paper_type: true,
        troquel: true,
        user: {
          select: {
            id: true,
            name: true,
            surename: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    res.status(200).json({
      status: "success",
      data: orders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener las órdenes" });
  }
};
const getOrderById = async (req, res) => {};
const updateOrder = async (req, res) => {};
const deleteOrder = async (req, res) => {};
const orderFinished = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.header_Production_Order.update({
      where: { id: parseInt(id) },
      data: { order_status: "TERMINADO" },
    });
    res.status(200).json({
      status: "success",
      message: "Orden finalizada exitosamente",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error al finalizar la orden",
    });
  }
};

export {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  orderFinished,
};
