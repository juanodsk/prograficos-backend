import express from "express";
import { login, logout, profile } from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// No hay registro público: los usuarios los crea un ADMIN desde la zona Seguridad.
router.post("/login", login);
router.post("/logout", logout);
router.get("/profile", verifyToken, profile);

export default router;
