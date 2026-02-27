import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import {
  createProductCustomer,
  getProductCustomer,
  getProductCustomers,
  updateProductCustomer,
  deleteProductCustomer,
} from "../controllers/product_customer.controller.js";

const router = express.Router();
router.post(
  "/",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERVISOR"),
  createProductCustomer,
);
router.get(
  "/:id",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERVISOR"),
  getProductCustomer,
);
router.get(
  "/",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERVISOR"),
  getProductCustomers,
);
router.put(
  "/:id",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERVISOR"),
  updateProductCustomer,
);
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERVISOR"),
  deleteProductCustomer,
);
export default router;
