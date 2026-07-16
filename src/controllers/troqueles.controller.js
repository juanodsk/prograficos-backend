import { prisma } from "../config/db.js";
import multer from "multer";
import { buildActiveWhere, normalizeIsActive } from "../utils/active.js";
import {
  buildInsensitiveContains,
  buildInsensitiveEquals,
  buildPaginationMeta,
  parsePagination,
  parseSort,
} from "../utils/pagination.js";
import { parseTroquelSearchTerm } from "../utils/troquel.js";

// Configuracion de multer para archivos en memoria (20MB maximo)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
});

const parseTroquelId = (id) => parseInt(id, 10);

const knownSizes = ["SMALL", "MEDIUM", "LARGE"];
const troquelCodePattern = /^(?=.*[A-Za-z0-9])[A-Za-z0-9_]+$/;
const duplicateCodeMessage =
  "El código del troquel ya está siendo utilizado para ese tamaño";

const validateTroquelCode = (code) => {
  if (!code) return "El código del troquel es obligatorio";

  if (!troquelCodePattern.test(code)) {
    return "El código del troquel solo puede contener letras, números y raya al piso";
  }

  return null;
};

const findTroquelBySizeAndCode = ({ code, size, excludeId = null }) =>
  prisma.troqueles.findFirst({
    where: {
      code: {
        equals: code,
        mode: "insensitive",
      },
      size,
      ...(excludeId != null ? { id: { not: excludeId } } : {}),
    },
    select: { id: true },
  });

const buildTroquelSearchWhere = (rawSearch) => {
  const search = rawSearch?.trim();

  if (!search) {
    return {};
  }

  const numericSearch = Number.parseInt(search, 10);
  const isNumericSearch = /^\d+$/.test(search);
  const matchedSizes = knownSizes.filter((size) =>
    size.toLowerCase().includes(search.toLowerCase()),
  );
  const parsedTroquelCode = parseTroquelSearchTerm(search);

  if (parsedTroquelCode?.size && !parsedTroquelCode.code) {
    return {
      size: parsedTroquelCode.size,
    };
  }

  if (
    parsedTroquelCode?.size &&
    parsedTroquelCode.code &&
    /^\d+$/.test(parsedTroquelCode.code)
  ) {
    return {
      AND: [
        { size: parsedTroquelCode.size },
        { code: buildInsensitiveEquals(parsedTroquelCode.code) },
      ],
    };
  }

  if (isNumericSearch) {
    return {
      OR: [
        { code: buildInsensitiveEquals(search) },
        ...(!Number.isNaN(numericSearch) ? [{ id: numericSearch }] : []),
      ],
    };
  }

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

  if (parsedTroquelCode?.size && parsedTroquelCode.code) {
    or.push({
      AND: [
        { size: parsedTroquelCode.size },
        { code: buildInsensitiveContains(parsedTroquelCode.code) },
      ],
    });
  }

  return { OR: or };
};

const troquelSortMap = {
  id: (direction) => [{ id: direction }],
  code: (direction) => [{ code: direction }],
  size: (direction) => [{ size: direction }],
  elaboration_date: (direction) => [{ elaboration_date: direction }],
  file: (direction) => [{ file_name: direction }],
  is_active: (direction) => [{ is_active: direction }, { id: "asc" }],
};

const troquelListSelect = {
  id: true,
  elaboration_date: true,
  code: true,
  size: true,
  file_name: true,
  createdAt: true,
  updatedAt: true,
  is_active: true,
};

// ───────────── CREAR TROQUEL ─────────────
const createTroqueles = async (req, res) => {
  try {
    const { code, elaboration_date, size, is_active } = req.body;
    const file = req.file;
    const normalizedCode = code?.trim();
    const codeError = validateTroquelCode(normalizedCode);

    if (codeError) {
      return res.status(400).json({
        status: "error",
        message: codeError,
      });
    }

    if (!size || !knownSizes.includes(size)) {
      return res.status(400).json({
        status: "error",
        message: "El tamaño del troquel es obligatorio",
      });
    }

    const duplicateTroquel = await findTroquelBySizeAndCode({
      code: normalizedCode,
      size,
    });

    if (duplicateTroquel) {
      return res.status(409).json({
        status: "warning",
        message: duplicateCodeMessage,
      });
    }

    const troquel = await prisma.troqueles.create({
      data: {
        code: normalizedCode,
        elaboration_date: elaboration_date
          ? new Date(elaboration_date)
          : new Date(),
        size,
        is_active: normalizeIsActive(is_active, true),
        file: file ? file.buffer.toString("base64") : null,
        file_name: file?.originalname || null,
      },
    });

    res.status(201).json({
      status: "success",
      message: "Troquel creado exitosamente",
      data: troquel,
    });
  } catch (error) {
    console.error(error);

    if (error?.code === "P2002") {
      return res.status(409).json({
        status: "warning",
        message: duplicateCodeMessage,
      });
    }

    res.status(500).json({
      status: "error",
      message: "Error al crear troquel",
    });
  }
};

// ───────────── OBTENER TODOS LOS TROQUELES ─────────────
const getTroqueles = async (req, res) => {
  try {
    const { page: requestedPage, pageSize } = parsePagination(req.query, {
      maxPageSize: 1000,
    });
    const { sortBy, sortDirection } = parseSort(req.query, {
      allowedSortBy: Object.keys(troquelSortMap),
      fallbackSortBy: "elaboration_date",
      fallbackSortDirection: "desc",
    });
    const where = buildActiveWhere(
      req.query,
      buildTroquelSearchWhere(req.query?.search),
    );
    const total = await prisma.troqueles.count({ where });
    const meta = buildPaginationMeta(requestedPage, pageSize, total);

    const troqueles = await prisma.troqueles.findMany({
      where,
      select: troquelListSelect,
      orderBy: troquelSortMap[sortBy](sortDirection),
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
    const { code, elaboration_date, size, is_active } = req.body;
    const normalizedCode = code?.trim();
    const codeError = validateTroquelCode(normalizedCode);

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

    if (codeError) {
      return res.status(400).json({
        status: "error",
        message: codeError,
      });
    }

    const normalizedSize = size || troquelExists.size;

    if (!normalizedSize || !knownSizes.includes(normalizedSize)) {
      return res.status(400).json({
        status: "error",
        message: "El tamaño del troquel es obligatorio",
      });
    }

    const duplicateTroquel = await findTroquelBySizeAndCode({
      code: normalizedCode,
      size: normalizedSize,
      excludeId: troquelId,
    });

    if (duplicateTroquel) {
      return res.status(409).json({
        status: "warning",
        message: duplicateCodeMessage,
      });
    }

    const dataToUpdate = {
      code: normalizedCode,
      elaboration_date: elaboration_date
        ? new Date(elaboration_date)
        : troquelExists.elaboration_date,
      size: normalizedSize,
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

    if (error?.code === "P2002") {
      return res.status(409).json({
        status: "warning",
        message: duplicateCodeMessage,
      });
    }

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
