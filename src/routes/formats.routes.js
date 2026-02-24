import express from "express";
import {
  createFormat,
  getFormat,
  getFormatById,
  updateFormat,
  deleteFormat,
} from "../controllers/formats.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
const router = express.Router();

router.post(
  "/",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERVISOR"),
  createFormat,
);
router.get("/", verifyToken, authorizeRoles("ADMIN", "SUPERVISOR"), getFormat);
router.get(
  "/:id",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERVISOR"),
  getFormatById,
);
router.put(
  "/:id",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERVISOR"),
  updateFormat,
);
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERVISOR"),
  deleteFormat,
);

export default router;
