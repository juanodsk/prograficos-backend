import express from "express";
import {
  getUsers,
  getOperators,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

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
router.get(
  "/:id",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERVISOR"),
  getUserById,
);

export default router;
