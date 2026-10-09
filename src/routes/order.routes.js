import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  requirePermission,
  requireAnyPermission,
} from "../middlewares/role.middleware.js";
import { ORDER_READ_KEYS } from "../constants/permissions.js";
import {
  createOrder,
  getOrders,
  getBoardOrders,
  getClosedOrdersAudit,
  getOrderById,
  updateOrder,
  deleteOrder,
  orderFinished,
} from "../controllers/order.controller.js";
const router = express.Router();

router.post("/", verifyToken, requirePermission("orders:create"), createOrder);
router.get("/", verifyToken, requireAnyPermission(...ORDER_READ_KEYS), getOrders);
router.get("/board", verifyToken, requirePermission("monitor:view"), getBoardOrders);
router.get("/audit", verifyToken, requirePermission("audit:view"), getClosedOrdersAudit);
router.get("/:id", verifyToken, requireAnyPermission(...ORDER_READ_KEYS), getOrderById);
router.put("/:id", verifyToken, requirePermission("orders:update"), updateOrder);
router.delete("/:id", verifyToken, requirePermission("orders:delete"), deleteOrder);
router.patch("/:id/finish", verifyToken, requirePermission("orders:finish"), orderFinished);

export default router;
