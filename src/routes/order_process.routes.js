import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import {
  finishOrderProcess,
  getOrderProcessById,
  getOrderProcesses,
  startOrderProcess,
} from "../controllers/order_process.controller.js";

const router = express.Router();

router.get("/order/:orderId", verifyToken, getOrderProcesses);
router.get("/:id", verifyToken, getOrderProcessById);
router.patch(
  "/:id/start",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERVISOR", "EMPLOYEE"),
  startOrderProcess,
);
router.patch(
  "/:id/finish",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERVISOR", "EMPLOYEE"),
  finishOrderProcess,
);

export default router;
