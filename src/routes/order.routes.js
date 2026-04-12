import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
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

router.post(
  "/",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERVISOR"),
  createOrder,
);
router.get("/", verifyToken, getOrders);
router.get("/board", verifyToken, getBoardOrders);
router.get("/audit", verifyToken, getClosedOrdersAudit);
router.get("/:id", verifyToken, getOrderById);
router.put(
  "/:id",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERVISOR", "EMPLOYEE"),
  updateOrder,
);
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERVISOR"),
  deleteOrder,
);
router.patch(
  "/:id/finish",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERVISOR"),
  orderFinished,
);

export default router;
