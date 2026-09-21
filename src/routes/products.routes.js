import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import {
  createProduct,
  getProduct,
  getProducts,
  getProductClients,
  updateProduct,
  deleteProduct,
} from "../controllers/products.controller.js";

const router = express.Router();
router.post(
  "/",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERVISOR"),
  createProduct,
);
router.get(
  "/customers",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERVISOR", "OPERATOR", "USER"),
  getProductClients,
);
router.get(
  "/:id",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERVISOR", "OPERATOR", "USER"),
  getProduct,
);
router.get(
  "/",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERVISOR", "OPERATOR", "USER"),
  getProducts,
);
router.put(
  "/:id",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERVISOR"),
  updateProduct,
);
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERVISOR"),
  deleteProduct,
);
export default router;
