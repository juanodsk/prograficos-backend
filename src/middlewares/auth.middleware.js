// src/middlewares/auth.middleware.js
import jwt from "jsonwebtoken";
import { getUserWithPermissions } from "../services/security.service.js";

export const verifyToken = async (req, res, next) => {
  try {
    const token =
      req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ message: "No autorizado, token requerido" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Se resuelven rol + permisos (claims) en cada request desde la BD:
    // así un cambio de permisos de un rol aplica de inmediato, sin re-login.
    const user = await getUserWithPermissions(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    if (!user.is_active) {
      return res.status(401).json({ message: "Usuario inactivo" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};
