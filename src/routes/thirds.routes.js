import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import {
  createThirds,
  getThirds,
  getThirdsById,
  updateThirds,
  deleteThirds,
} from "../controllers/thirds.controller.js";
const router = express.Router();

router.post(
  "/",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERVISOR"),
  createThirds,
);
router.get("/", verifyToken, authorizeRoles("ADMIN", "SUPERVISOR"), getThirds);
router.get(
  "/:id",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERVISOR"),
  getThirdsById,
);
router.put(
  "/:id",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERVISOR"),
  updateThirds,
);
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERVISOR"),
  deleteThirds,
);

export default router;
