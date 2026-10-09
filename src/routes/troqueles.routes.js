import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  requirePermission,
  requireAnyPermission,
} from "../middlewares/role.middleware.js";
import { TROQUELES_READ_KEYS } from "../constants/permissions.js";
import { uploadTroquelImages } from "../config/upload.js";
import {
  createTroqueles,
  getTroqueles,
  getTroquelesById,
  updateTroqueles,
  deleteTroqueles,
  getTroquelImages,
  uploadTroquelImagesController,
  deleteTroquelImage,
} from "../controllers/troqueles.controller.js";

const router = express.Router();

// Lectura: módulo o flujo de órdenes · Escritura: troqueles:create/update/delete (ADMIN bypass).
router.post("/", verifyToken, requirePermission("troqueles:create"), createTroqueles);
router.get("/", verifyToken, requireAnyPermission(...TROQUELES_READ_KEYS), getTroqueles);
router.get("/:id", verifyToken, requireAnyPermission(...TROQUELES_READ_KEYS), getTroquelesById);
router.put("/:id", verifyToken, requirePermission("troqueles:update"), updateTroqueles);
router.delete("/:id", verifyToken, requirePermission("troqueles:delete"), deleteTroqueles);

// ───────────── Imágenes de referencia (R2) ─────────────
router.get(
  "/:id/images",
  verifyToken,
  requireAnyPermission(...TROQUELES_READ_KEYS),
  getTroquelImages,
);
router.post(
  "/:id/images",
  verifyToken,
  requireAnyPermission("troqueles:create", "troqueles:update"),
  uploadTroquelImages,
  uploadTroquelImagesController,
);
router.delete(
  "/:id/images/:imageId",
  verifyToken,
  requireAnyPermission("troqueles:create", "troqueles:update"),
  deleteTroquelImage,
);

export default router;
