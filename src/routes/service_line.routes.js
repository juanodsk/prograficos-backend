import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/role.middleware.js";
import {
  getServiceLines,
  getServiceLineById,
  createServiceLine,
  updateServiceLine,
  deleteServiceLine,
} from "../controllers/service_line.controller.js";

const router = express.Router();

// Lectura: dato de referencia usado en varios módulos (terceros, productos…),
// basta estar autenticado. Escritura: catalogs:manage (ADMIN bypass).
router.post("/", verifyToken, requirePermission("catalogs:manage"), createServiceLine);
router.get("/", verifyToken, getServiceLines);
router.get("/:id", verifyToken, getServiceLineById);
router.put("/:id", verifyToken, requirePermission("catalogs:manage"), updateServiceLine);
router.delete("/:id", verifyToken, requirePermission("catalogs:manage"), deleteServiceLine);

export default router;
