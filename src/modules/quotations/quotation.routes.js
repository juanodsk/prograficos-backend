import { Router } from "express";
import { verifyToken } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/role.middleware.js";
import {
  createQuotation,
  getQuotations,
  getQuotationById,
  updateQuotation,
  sendQuotation,
  deleteQuotation,
} from "./quotation.controller.js";

const router = Router();

router.post("/", verifyToken, requirePermission("quotations:create"), createQuotation);
router.get("/", verifyToken, requirePermission("quotations:view"), getQuotations);
router.get("/:id", verifyToken, requirePermission("quotations:view"), getQuotationById);
router.put("/:id", verifyToken, requirePermission("quotations:update"), updateQuotation);
router.patch("/:id/send", verifyToken, requirePermission("quotations:update"), sendQuotation);
router.delete("/:id", verifyToken, requirePermission("quotations:delete"), deleteQuotation);

export default router;
