import express from "express";
import {
  createFormat,
  getFormat,
  getFormatById,
  updateFormat,
  deleteFormat,
} from "../controllers/formats.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  requirePermission,
  requireAnyPermission,
} from "../middlewares/role.middleware.js";
import { CATALOG_READ_KEYS } from "../constants/permissions.js";
const router = express.Router();

// Lectura: cualquiera del flujo de catálogos/órdenes · Escritura: catalogs:manage (ADMIN bypass).
router.post("/", verifyToken, requirePermission("catalogs:manage"), createFormat);
router.get("/", verifyToken, requireAnyPermission(...CATALOG_READ_KEYS), getFormat);
router.get("/:id", verifyToken, requireAnyPermission(...CATALOG_READ_KEYS), getFormatById);
router.put("/:id", verifyToken, requirePermission("catalogs:manage"), updateFormat);
router.delete("/:id", verifyToken, requirePermission("catalogs:manage"), deleteFormat);

export default router;
