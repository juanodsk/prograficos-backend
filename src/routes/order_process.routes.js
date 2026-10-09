import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  requirePermission,
  requireAnyPermission,
} from "../middlewares/role.middleware.js";
import { ORDER_READ_KEYS } from "../constants/permissions.js";
import {
  finishOrderProcess,
  getOrderProcessById,
  getOrderProcesses,
  startOrderProcess,
  editOrderProcess,
} from "../controllers/order_process.controller.js";

const router = express.Router();

router.get(
  "/order/:orderId",
  verifyToken,
  requireAnyPermission(...ORDER_READ_KEYS),
  getOrderProcesses,
);
router.get("/:id", verifyToken, requireAnyPermission(...ORDER_READ_KEYS), getOrderProcessById);
router.patch(
  "/:id/start",
  verifyToken,
  requirePermission("orders:operate"),
  startOrderProcess,
);
router.patch(
  "/:id/finish",
  verifyToken,
  requirePermission("orders:operate"),
  finishOrderProcess,
);
router.patch(
  "/:id/edit",
  verifyToken,
  requirePermission("orders:edit_processes"),
  editOrderProcess,
);

export default router;
