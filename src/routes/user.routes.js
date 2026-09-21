import express from "express";
import {
  getUsers,
  getOperators,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  uploadAvatar,
  removeAvatar,
} from "../controllers/user.controller.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { uploadUserAvatar } from "../config/upload.js";

const router = express.Router();

router.get("/", verifyToken, authorizeRoles("ADMIN", "SUPERVISOR"), getUsers);
router.get(
  "/operators",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERVISOR"),
  getOperators,
);
router.post(
  "/create",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERVISOR"),
  createUser,
);
router.put(
  "/update/:id",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERVISOR"),
  updateUser,
);
router.delete(
  "/delete/:id",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERVISOR"),
  deleteUser,
);
router.post(
  "/:id/avatar",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERVISOR"),
  uploadUserAvatar,
  uploadAvatar,
);
router.delete(
  "/:id/avatar",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERVISOR"),
  removeAvatar,
);
router.get(
  "/:id",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERVISOR"),
  getUserById,
);

export default router;
