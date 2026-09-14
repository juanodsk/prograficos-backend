import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
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

// Rutas
router.post(
  "/",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERVISOR"),
  createTroqueles,
);

router.get("/", verifyToken, getTroqueles);
router.get("/:id", verifyToken, getTroquelesById);

router.put(
  "/:id",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERVISOR"),
  updateTroqueles,
);

router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERVISOR"),
  deleteTroqueles,
);

// ───────────── Imágenes de referencia (R2) ─────────────
router.get("/:id/images", verifyToken, getTroquelImages);

router.post(
  "/:id/images",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERVISOR"),
  uploadTroquelImages,
  uploadTroquelImagesController,
);

router.delete(
  "/:id/images/:imageId",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERVISOR"),
  deleteTroquelImage,
);

export default router;
