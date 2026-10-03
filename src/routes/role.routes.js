import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/role.middleware.js";
import {
  getRoles,
  getRoleById,
  getPermissions,
  createRole,
  updateRole,
  deleteRole,
  updateRolePermissions,
} from "../controllers/role.controller.js";

const router = express.Router();

// Toda la zona de seguridad es exclusiva de ADMIN.
router.use(verifyToken, requireAdmin);

router.get("/permissions", getPermissions);
router.get("/", getRoles);
router.get("/:id", getRoleById);
router.post("/", createRole);
router.put("/:id/permissions", updateRolePermissions);
router.put("/:id", updateRole);
router.delete("/:id", deleteRole);

export default router;
