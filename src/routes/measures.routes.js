import express from "express";
import {
  createMeasure,
  getMeasure,
  updateMeasure,
  deleteMeasure,
  getMeasureById,
} from "../controllers/measures.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.post(
  "/",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERVISOR"),
  createMeasure,
);
router.get(
  "/:id",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERVISOR", "EMPLOYEE", "USER"),
  getMeasureById,
);
router.get(
  "/",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERVISOR", "EMPLOYEE", "USER"),
  getMeasure,
);
router.put(
  "/:id",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERVISOR"),
  updateMeasure,
);
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERVISOR"),
  deleteMeasure,
);

export default router;
