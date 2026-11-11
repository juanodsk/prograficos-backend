import express from "express";
import { login, logout, profile } from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { loginLimiter } from "../middlewares/rateLimit.js";

const router = express.Router();

// No hay registro público: los usuarios los crea un ADMIN desde la zona Seguridad.
router.post("/login", loginLimiter, login);
router.post("/logout", logout);
router.get("/profile", verifyToken, profile);

export default router;
