import { prisma } from "../config/db.js";
import bcrypt from "bcryptjs";
import {
  generateToken,
  resolveTokenCookieOptions,
} from "../utils/generateToken.js";
import { buildUserAvatarUrl } from "../services/userAvatar.service.js";
import { getUserWithPermissions } from "../services/security.service.js";

const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Usuario y contraseña son obligatorios" });
  }

  // El inicio de sesión es por username (no por email).
  const user = await prisma.user.findUnique({
    where: { username: String(username).trim().toLowerCase() },
  });

  if (!user) {
    return res
      .status(401)
      .json({ message: "Usuario o contraseña incorrectos" });
  }

  if (!user.is_active) {
    return res
      .status(403)
      .json({ message: "No puedes iniciar sesión, el usuario está inactivo" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res
      .status(401)
      .json({ message: "Usuario o contraseña incorrectos" });
  }

  generateToken(user.id, res);

  // Devolvemos el usuario con rol + permisos (claims) resueltos.
  const authUser = await getUserWithPermissions(user.id);

  res.status(200).json({
    status: "success",
    data: {
      user: {
        ...authUser,
        avatar_url: await buildUserAvatarUrl(user.avatar_key),
      },
    },
  });
};

const logout = async (req, res) => {
  res.cookie("token", "", {
    ...resolveTokenCookieOptions(),
    expires: new Date(0),
  });
  res.status(200).json({
    status: "success",
    message: "Sesion cerrada exitosamente",
  });
};

const profile = async (req, res) => {
  try {
    // req.user ya viene resuelto (rol + permisos) desde verifyToken.
    const authUser = await getUserWithPermissions(req.user.id);

    if (!authUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    if (!authUser.is_active) {
      return res.status(401).json({ message: "Usuario inactivo" });
    }

    res.status(200).json({
      status: "success",
      data: {
        user: {
          ...authUser,
          avatar_url: await buildUserAvatarUrl(authUser.avatar_key),
        },
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el perfil" });
  }
};

export { login, logout, profile };
