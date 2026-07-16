import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";

import { authorizeRoles } from "../middlewares/role.middleware.js";
import {
  createMachinery,
  validateMachineryReference,
  getMachinery,
  getMachineryById,
  updateMachinery,
  deleteMachinery,
} from "../controllers/machinery.controller.js";

const router = express.Router();

router.post(
  "/",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERVISOR"),
  createMachinery,
);
router.get(
  "/",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERVISOR", "EMPLOYEE", "USER"),
  getMachinery,
);
router.get(
  "/validate-reference",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERVISOR"),
  validateMachineryReference,
);
router.get(
  "/:id",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERVISOR", "EMPLOYEE", "USER"),
  getMachineryById,
);
router.put(
  "/:id",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERVISOR"),
  updateMachinery,
);
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERVISOR"),
  deleteMachinery,
);

export default router;
