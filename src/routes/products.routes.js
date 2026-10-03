import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  requirePermission,
  requireAnyPermission,
} from "../middlewares/role.middleware.js";
import { PRODUCTS_READ_KEYS } from "../constants/permissions.js";
import {
  createProduct,
  getProduct,
  getProducts,
  getProductClients,
  checkProductCode,
  updateProduct,
  deleteProduct,
} from "../controllers/products.controller.js";

const router = express.Router();

// Lectura: módulo o flujo de órdenes · Escritura: products:create/update/delete (ADMIN bypass).
router.post("/", verifyToken, requirePermission("products:create"), createProduct);
router.get(
  "/customers",
  verifyToken,
  requireAnyPermission(...PRODUCTS_READ_KEYS),
  getProductClients,
);
router.get(
  "/check-code",
  verifyToken,
  requireAnyPermission("products:create", "products:update"),
  checkProductCode,
);
router.get("/:id", verifyToken, requireAnyPermission(...PRODUCTS_READ_KEYS), getProduct);
router.get("/", verifyToken, requireAnyPermission(...PRODUCTS_READ_KEYS), getProducts);
router.put("/:id", verifyToken, requirePermission("products:update"), updateProduct);
router.delete("/:id", verifyToken, requirePermission("products:delete"), deleteProduct);

export default router;
