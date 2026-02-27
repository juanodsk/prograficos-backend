import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import {
  createProcess,
  getProcesses,
  getProcessById,
  updateProcess,
  deleteProcess,
} from "../controllers/processes.controller.js";

const router = express.Router();

router.post(
  "/",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERVISOR"),
  createProcess,
);
router.get(
  "/",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERVISOR"),
  getProcesses,
);
router.get(
  "/:id",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERVISOR"),
  getProcessById,
);
router.put(
  "/:id",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERVISOR"),
  updateProcess,
);
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERVISOR"),
  deleteProcess,
);

export default router;
