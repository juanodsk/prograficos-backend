import express from "express";
import {
  createMeasure,
  getMeasure,
  updateMeasure,
  deleteMeasure,
  getMeasureById,
} from "../controllers/measures.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  requirePermission,
  requireAnyPermission,
} from "../middlewares/role.middleware.js";
import { CATALOG_READ_KEYS } from "../constants/permissions.js";

const router = express.Router();

// Lectura: cualquiera del flujo de catálogos/órdenes · Escritura: catalogs:manage (ADMIN bypass).
router.post("/", verifyToken, requirePermission("catalogs:manage"), createMeasure);
router.get("/:id", verifyToken, requireAnyPermission(...CATALOG_READ_KEYS), getMeasureById);
router.get("/", verifyToken, requireAnyPermission(...CATALOG_READ_KEYS), getMeasure);
router.put("/:id", verifyToken, requirePermission("catalogs:manage"), updateMeasure);
router.delete("/:id", verifyToken, requirePermission("catalogs:manage"), deleteMeasure);

export default router;
