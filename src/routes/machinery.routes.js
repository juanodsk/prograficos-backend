import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";

import {
  requirePermission,
  requireAnyPermission,
} from "../middlewares/role.middleware.js";
import { CATALOG_READ_KEYS } from "../constants/permissions.js";
import {
  createMachinery,
  validateMachineryReference,
  getMachinery,
  getMachineryById,
  updateMachinery,
  deleteMachinery,
} from "../controllers/machinery.controller.js";

const router = express.Router();

// Lectura: cualquiera del flujo de catálogos/órdenes · Escritura: catalogs:manage (ADMIN bypass).
router.post("/", verifyToken, requirePermission("catalogs:manage"), createMachinery);
router.get("/", verifyToken, requireAnyPermission(...CATALOG_READ_KEYS), getMachinery);
router.get(
  "/validate-reference",
  verifyToken,
  requirePermission("catalogs:manage"),
  validateMachineryReference,
);
router.get("/:id", verifyToken, requireAnyPermission(...CATALOG_READ_KEYS), getMachineryById);
router.put("/:id", verifyToken, requirePermission("catalogs:manage"), updateMachinery);
router.delete("/:id", verifyToken, requirePermission("catalogs:manage"), deleteMachinery);

export default router;
