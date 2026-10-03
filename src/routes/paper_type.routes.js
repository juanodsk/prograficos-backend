import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  requirePermission,
  requireAnyPermission,
} from "../middlewares/role.middleware.js";
import { CATALOG_READ_KEYS } from "../constants/permissions.js";
import {
  createPaperType,
  getPaperType,
  getPaperTypeById,
  updatePaperType,
  deletePaperType,
} from "../controllers/paper_type.controller.js";
const router = express.Router();

// Lectura: cualquiera del flujo de catálogos/órdenes · Escritura: catalogs:manage (ADMIN bypass).
router.post("/", verifyToken, requirePermission("catalogs:manage"), createPaperType);
router.get("/", verifyToken, requireAnyPermission(...CATALOG_READ_KEYS), getPaperType);
router.get("/:id", verifyToken, requireAnyPermission(...CATALOG_READ_KEYS), getPaperTypeById);
router.put("/:id", verifyToken, requirePermission("catalogs:manage"), updatePaperType);
router.delete("/:id", verifyToken, requirePermission("catalogs:manage"), deletePaperType);

export default router;
