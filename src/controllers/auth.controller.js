import { prisma } from "../config/db.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";

const register = async (req, res) => {
  const { name, surename, email, password } = req.body;

  //CHECK IF USER ALREADY EXISTS//
  const userExists = await prisma.user.findUnique({
    where: { email: email },
  });

  if (userExists) {
    return res
      .status(400)
      .json({ message: "Usuario ya existe con este email" });
  }

  //HASH PASSWORD//
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  //CREATE USER//
  const user = await prisma.user.create({
    data: {
      name,
      surename,
      email,
      password: hashedPassword,
    },
  });
  //GENERATE JWT TOKEN//
  const token = generateToken(user.id, res);
  res.status(201).json({
    status: "success",
    data: {
      user: {
        id: user.id,
        name: user.name,
        surename: user.surename,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
      token,
    },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  //CHECK IF USER EXISTS//
  const user = await prisma.user.findUnique({
    where: { email: email },
  });

  if (!user) {
    return res.status(401).json({ message: "Email o contraseña incorrectos" });
  }

  if (!user.is_active) {
    return res.status(401).json({ message: "Tu usuario está inactivo" });
  }

  //VERIFY PASSWORD//
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Email o contraseña incorrectos" });
  }

  //GENERATE JWT TOKEN//
  const token = generateToken(user.id, res);

  res.status(200).json({
    status: "success",
    data: {
      user: {
        id: user.id,
        name: user.name,
        surename: user.surename,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
      token,
    },
  });
};

const logout = async (req, res) => {
  res.cookie("token", "", {
    expires: new Date(0),
  });
  res.status(200).json({
    status: "success",
    message: "Sesion cerrada exitosamente",
  });
};

const profile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
      select: {
        id: true,
        name: true,
        surename: true,
        email: true,
        role: true,
        avatar: true,
        is_active: true,
      },
    });
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (!user.is_active) {
      return res.status(401).json({ message: "Usuario inactivo" });
    }

    res.status(200).json({
      status: "success",
      data: { user },
    });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el perfil" });
  }
};

export { register, login, logout, profile };
