import { prisma } from "../config/db.js";
import multer from "multer";
import { buildActiveWhere, normalizeIsActive } from "../utils/active.js";
import {
  buildInsensitiveContains,
  buildPaginationMeta,
  parsePagination,
} from "../utils/pagination.js";

// Configuracion de multer para archivos en memoria (20MB maximo)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
});

const parseTroquelId = (id) => parseInt(id, 10);

const knownSizes = ["SMALL", "MEDIUM", "LARGE"];

const buildTroquelSearchWhere = (rawSearch) => {
  const search = rawSearch?.trim();

  if (!search) {
    return {};
  }

  const numericSearch = Number.parseInt(search, 10);
  const matchedSizes = knownSizes.filter((size) =>
    size.toLowerCase().includes(search.toLowerCase()),
  );

  const or = [
    { code: buildInsensitiveContains(search) },
    { file_name: buildInsensitiveContains(search) },
  ];

  if (!Number.isNaN(numericSearch)) {
    or.push({ id: numericSearch });
  }

  if (matchedSizes.length > 0) {
    or.push({ size: { in: matchedSizes } });
  }

  return { OR: or };
};

// ───────────── CREAR TROQUEL ─────────────
const createTroqueles = async (req, res) => {
  try {
    const { elaboration_date, size, is_active } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        status: "error",
        message: "Debes adjuntar un archivo para crear el troquel",
      });
    }

    const troquel = await prisma.troqueles.create({
      data: {
        elaboration_date: elaboration_date
          ? new Date(elaboration_date)
          : new Date(),
        size,
        is_active: normalizeIsActive(is_active, true),
        file: file.buffer.toString("base64"),
        file_name: file.originalname || null,
      },
    });

    res.status(201).json({
      status: "success",
      message: "Troquel creado exitosamente",
      data: troquel,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Error al crear troquel",
    });
  }
};

// ───────────── OBTENER TODOS LOS TROQUELES ─────────────
const getTroqueles = async (req, res) => {
  try {
    const { page: requestedPage, pageSize } = parsePagination(req.query);
    const where = buildActiveWhere(req.query, buildTroquelSearchWhere(req.query?.search));
    const total = await prisma.troqueles.count({ where });
    const meta = buildPaginationMeta(requestedPage, pageSize, total);

    const troqueles = await prisma.troqueles.findMany({
      where,
      orderBy: { elaboration_date: "desc" },
      skip: (meta.page - 1) * meta.pageSize,
      take: meta.pageSize,
    });

    res.status(200).json({
      status: "success",
      message: "Troqueles obtenidos exitosamente",
      data: troqueles,
      meta,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Error al obtener troqueles",
    });
  }
};

// ───────────── OBTENER TROQUEL POR ID ─────────────
const getTroquelesById = async (req, res) => {
  try {
    const troquelId = parseTroquelId(req.params.id);

    if (Number.isNaN(troquelId)) {
      return res.status(400).json({
        status: "error",
        message: "El id del troquel no es valido",
      });
    }

    const troquel = await prisma.troqueles.findUnique({
      where: { id: troquelId },
    });

    if (!troquel) {
      return res.status(404).json({
        status: "error",
        message: "Troquel no encontrado",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Troquel obtenido exitosamente",
      data: troquel,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Error al obtener troquel",
    });
  }
};

// ───────────── ACTUALIZAR TROQUEL ─────────────
const updateTroqueles = async (req, res) => {
  try {
    const troquelId = parseTroquelId(req.params.id);
    const { elaboration_date, size, is_active } = req.body;

    if (Number.isNaN(troquelId)) {
      return res.status(400).json({
        status: "error",
        message: "El id del troquel no es valido",
      });
    }

    const troquelExists = await prisma.troqueles.findUnique({
      where: { id: troquelId },
    });

    if (!troquelExists) {
      return res.status(404).json({
        status: "error",
        message: "Troquel no encontrado",
      });
    }

    const dataToUpdate = {
      elaboration_date: elaboration_date
        ? new Date(elaboration_date)
        : troquelExists.elaboration_date,
      size: size || troquelExists.size,
      is_active: normalizeIsActive(is_active, troquelExists.is_active),
    };

    if (req.file) {
      dataToUpdate.file = req.file.buffer.toString("base64");
      dataToUpdate.file_name = req.file.originalname || troquelExists.file_name;
    }

    const troquel = await prisma.troqueles.update({
      where: { id: troquelId },
      data: dataToUpdate,
    });

    res.status(200).json({
      status: "success",
      message: "Troquel actualizado exitosamente",
      data: troquel,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Error al actualizar troquel",
    });
  }
};

// ───────────── ELIMINAR TROQUEL ─────────────
const deleteTroqueles = async (req, res) => {
  try {
    const troquelId = parseTroquelId(req.params.id);

    if (Number.isNaN(troquelId)) {
      return res.status(400).json({
        status: "error",
        message: "El id del troquel no es valido",
      });
    }

    const troquelExists = await prisma.troqueles.findUnique({
      where: { id: troquelId },
    });

    if (!troquelExists) {
      return res.status(404).json({
        status: "error",
        message: "Troquel no encontrado",
      });
    }

    const ordersCount = await prisma.header_Production_Order.count({
      where: {
        troquel_id: troquelId,
        is_active: true,
      },
    });

    if (ordersCount > 0) {
      return res.status(400).json({
        status: "error",
        message:
          "No se puede desactivar el troquel porque tiene ordenes activas asociadas",
      });
    }

    const troquel = await prisma.troqueles.update({
      where: { id: troquelId },
      data: { is_active: false },
    });

    res.status(200).json({
      status: "success",
      message: "Troquel desactivado exitosamente",
      data: troquel,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Error al eliminar troquel",
    });
  }
};

export {
  createTroqueles,
  getTroqueles,
  getTroquelesById,
  updateTroqueles,
  deleteTroqueles,
  upload,
};
