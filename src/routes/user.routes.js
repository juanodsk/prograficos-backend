import express from "express";
import {
  getUsers,
  getOperators,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  checkUsername,
  uploadAvatar,
  removeAvatar,
} from "../controllers/user.controller.js";
import { authorizeRoles, requireAdmin } from "../middlewares/role.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { uploadUserAvatar } from "../config/upload.js";

const router = express.Router();

// Lista de operarios: operativa (la usan ADMIN y SUPERVISOR al crear órdenes).
router.get(
  "/operators",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERVISOR"),
  getOperators,
);

// Gestión de usuarios = zona de Seguridad: solo ADMIN.
router.get("/", verifyToken, requireAdmin, getUsers);
router.get("/check-username", verifyToken, requireAdmin, checkUsername);
router.post("/create", verifyToken, requireAdmin, createUser);
router.put("/update/:id", verifyToken, requireAdmin, updateUser);
router.delete("/delete/:id", verifyToken, requireAdmin, deleteUser);
router.post(
  "/:id/avatar",
  verifyToken,
  requireAdmin,
  uploadUserAvatar,
  uploadAvatar,
);
router.delete("/:id/avatar", verifyToken, requireAdmin, removeAvatar);
router.get("/:id", verifyToken, requireAdmin, getUserById);

export default router;
