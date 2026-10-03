import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  requirePermission,
  requireAnyPermission,
} from "../middlewares/role.middleware.js";
import { CATALOG_READ_KEYS } from "../constants/permissions.js";
import {
  createProcess,
  getProcesses,
  getProcessById,
  validateProcessFieldKey,
  updateProcess,
  reorderProcesses,
  deleteProcess,
} from "../controllers/processes.controller.js";

const router = express.Router();

// Lectura: cualquiera del flujo de catálogos/órdenes · Escritura: catalogs:manage (ADMIN bypass).
router.post("/", verifyToken, requirePermission("catalogs:manage"), createProcess);
router.get("/", verifyToken, requireAnyPermission(...CATALOG_READ_KEYS), getProcesses);
router.get(
  "/validate-field-key",
  verifyToken,
  requirePermission("catalogs:manage"),
  validateProcessFieldKey,
);
router.patch(
  "/reorder",
  verifyToken,
  requirePermission("catalogs:manage"),
  reorderProcesses,
);
router.get("/:id", verifyToken, requireAnyPermission(...CATALOG_READ_KEYS), getProcessById);
router.put("/:id", verifyToken, requirePermission("catalogs:manage"), updateProcess);
router.delete("/:id", verifyToken, requirePermission("catalogs:manage"), deleteProcess);

export default router;
