import express from "express";
import multer from "multer";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import {
  createTroqueles,
  getTroqueles,
  getTroquelesById,
  updateTroqueles,
  deleteTroqueles,
} from "../controllers/troqueles.controller.js";

const router = express.Router();

// Configuración de multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB máximo
});

// Rutas
router.post(
  "/",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERVISOR"),
  upload.single("file"),
  createTroqueles,
);

router.get("/", verifyToken, getTroqueles);
router.get("/:id", verifyToken, getTroquelesById);

router.put(
  "/:id",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERVISOR"),
  upload.single("file"),
  updateTroqueles,
);

router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERVISOR"),
  deleteTroqueles,
);

export default router;
