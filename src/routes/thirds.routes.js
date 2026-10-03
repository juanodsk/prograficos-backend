import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  requirePermission,
  requireAnyPermission,
} from "../middlewares/role.middleware.js";
import { THIRDS_READ_KEYS } from "../constants/permissions.js";
import {
  createThirds,
  getThirds,
  getThirdsById,
  updateThirds,
  deleteThirds,
} from "../controllers/thirds.controller.js";
const router = express.Router();

// Lectura: módulo o flujo de órdenes · Escritura: thirds:create/update/delete (ADMIN bypass).
router.post("/", verifyToken, requirePermission("thirds:create"), createThirds);
router.get("/", verifyToken, requireAnyPermission(...THIRDS_READ_KEYS), getThirds);
router.get("/:id", verifyToken, requireAnyPermission(...THIRDS_READ_KEYS), getThirdsById);
router.put("/:id", verifyToken, requirePermission("thirds:update"), updateThirds);
router.delete("/:id", verifyToken, requirePermission("thirds:delete"), deleteThirds);

export default router;
