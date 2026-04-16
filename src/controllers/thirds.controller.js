import { prisma } from "../config/db.js";
import { buildActiveWhere, normalizeIsActive } from "../utils/active.js";
import {
  buildInsensitiveContains,
  buildPaginationMeta,
  parsePagination,
  parseSort,
} from "../utils/pagination.js";
import {
  isValidDocumentType,
  isValidPersonType,
  isValidThirdType,
} from "../constants/thirds.js";

const knownThirdTypes = ["CLIENTE", "PROVEEDOR", "OTROS"];
const knownPersonTypes = ["NATURAL", "JURIDICA"];
const knownDocumentTypes = ["NIT", "CC", "CE", "PASAPORTE"];

const thirdDetailInclude = {
  products: {
    include: {
      troquel: {
        select: {
          id: true,
          code: true,
          size: true,
          file_name: true,
          elaboration_date: true,
          is_active: true,
        },
      },
    },
    orderBy: [{ is_active: "desc" }, { name: "asc" }, { id: "asc" }],
  },
};

const buildThirdSearchWhere = (rawSearch) => {
  const search = rawSearch?.trim();

  if (!search) {
    return {};
  }

  const numericSearch = Number.parseInt(search, 10);
  const normalizedSearch = search.toLowerCase();
  const matchedThirdTypes = knownThirdTypes.filter((value) =>
    value.toLowerCase().includes(normalizedSearch),
  );
  const matchedPersonTypes = knownPersonTypes.filter((value) =>
    value.toLowerCase().includes(normalizedSearch),
  );
  const matchedDocumentTypes = knownDocumentTypes.filter((value) =>
    value.toLowerCase().includes(normalizedSearch),
  );

  const or = [
    { name: buildInsensitiveContains(search) },
    { email: buildInsensitiveContains(search) },
    { address: buildInsensitiveContains(search) },
    { company_name: buildInsensitiveContains(search) },
    { document_number: buildInsensitiveContains(search) },
  ];

  if (!Number.isNaN(numericSearch)) {
    or.push({ id: numericSearch });
  }

  if (matchedThirdTypes.length > 0) {
    or.push({ type_person: { in: matchedThirdTypes } });
  }

  if (matchedPersonTypes.length > 0) {
    or.push({ person_type: { in: matchedPersonTypes } });
  }

  if (matchedDocumentTypes.length > 0) {
    or.push({ document_type: { in: matchedDocumentTypes } });
  }

  return { OR: or };
};

const buildThirdTypeWhere = (rawTypePerson) => {
  const typePerson = rawTypePerson?.trim()?.toUpperCase();

  if (!typePerson || !knownThirdTypes.includes(typePerson)) {
    return {};
  }

  return { type_person: typePerson };
};

const thirdSortMap = {
  id: (direction) => [{ id: direction }],
  name: (direction) => [{ name: direction }],
  email: (direction) => [{ email: direction }],
  type_person: (direction) => [{ type_person: direction }, { name: "asc" }],
  person_type: (direction) => [{ person_type: direction }, { name: "asc" }],
  company_name: (direction) => [{ company_name: direction }, { name: "asc" }],
  is_active: (direction) => [{ is_active: direction }, { name: "asc" }],
};

const normalizeThirdPayload = (body, fallbackIsActive = true) => ({
  name: body?.name?.trim(),
  email: body?.email?.trim() || null,
  address: body?.address?.trim(),
  type_person: body?.type_person,
  person_type: body?.person_type,
  document_type: body?.document_type,
  document_number: body?.document_number?.trim(),
  company_name: body?.company_name?.trim() || null,
  is_active: normalizeIsActive(body?.is_active, fallbackIsActive),
});

const validateThirdPayload = async (payload, currentId = null) => {
  if (!payload.name) {
    return "El nombre es obligatorio";
  }

  if (!payload.email) {
    return "El email es obligatorio";
  }

  if (!/\S+@\S+\.\S+/.test(payload.email)) {
    return "El email no es válido";
  }

  if (!payload.address) {
    return "La dirección es obligatoria";
  }

  if (!payload.type_person || !isValidThirdType(payload.type_person)) {
    return "El tipo de tercero seleccionado no es válido";
  }

  if (!payload.person_type || !isValidPersonType(payload.person_type)) {
    return "El tipo de persona seleccionado no es válido";
  }

  if (!payload.document_type || !isValidDocumentType(payload.document_type)) {
    return "El tipo de documento seleccionado no es válido";
  }

  if (!payload.document_number) {
    return "El número de documento es obligatorio";
  }

  const duplicateEmail = await prisma.thirds.findFirst({
    where: {
      email: {
        equals: payload.email,
        mode: "insensitive",
      },
      ...(currentId != null ? { id: { not: currentId } } : {}),
    },
    select: { id: true },
  });

  if (duplicateEmail) {
    return "Ya existe un tercero con ese email";
  }

  const duplicateDocument = await prisma.thirds.findFirst({
    where: {
      document_type: payload.document_type,
      document_number: payload.document_number,
      ...(currentId != null ? { id: { not: currentId } } : {}),
    },
    select: { id: true },
  });

  if (duplicateDocument) {
    return "Ya existe un tercero con ese tipo y número de documento";
  }

  return null;
};

const createThirds = async (req, res) => {
  try {
    const payload = normalizeThirdPayload(req.body, true);
    const validationError = await validateThirdPayload(payload);

    if (validationError) {
      return res.status(400).json({
        status: "error",
        message: validationError,
      });
    }

    const third = await prisma.thirds.create({
      data: payload,
    });
    res.status(201).json({
      status: "success",
      message: "Tercero creado exitosamente",
      data: { third },
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Error al crear tercero" });
  }
};
const getThirds = async (req, res) => {
  try {
    const { page: requestedPage, pageSize } = parsePagination(req.query, {
      maxPageSize: 1000,
    });
    const { sortBy, sortDirection } = parseSort(req.query, {
      allowedSortBy: Object.keys(thirdSortMap),
      fallbackSortBy: "name",
      fallbackSortDirection: "asc",
    });
    const filters = [
      buildThirdSearchWhere(req.query?.search),
      buildThirdTypeWhere(req.query?.typePerson),
    ].filter((filter) => Object.keys(filter).length > 0);
    const where = buildActiveWhere(
      req.query,
      filters.length > 0 ? { AND: filters } : {},
    );
    const total = await prisma.thirds.count({ where });
    const meta = buildPaginationMeta(requestedPage, pageSize, total);

    const thirds = await prisma.thirds.findMany({
      where,
      orderBy: thirdSortMap[sortBy](sortDirection),
      skip: (meta.page - 1) * meta.pageSize,
      take: meta.pageSize,
    });
    res.status(200).json({
      status: "success",
      message: "Terceros obtenidos exitosamente",
      data: { thirds },
      meta,
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Error al obtener terceros" });
  }
};
const getThirdsById = async (req, res) => {
  try {
    const { id } = req.params;
    const third = await prisma.thirds.findUnique({
      where: { id: parseInt(id) },
      include: thirdDetailInclude,
    });
    if (!third) {
      return res.status(404).json({
        status: "error",
        message: "Tercero no encontrado",
      });
    }
    res.status(200).json({
      status: "success",
      message: "Tercero obtenido exitosamente",
      data: { third },
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Error al obtener tercero" });
  }
};
const updateThirds = async (req, res) => {
  try {
    const { id } = req.params;
    const thirdId = parseInt(id);

    const thirdExists = await prisma.thirds.findUnique({
      where: { id: thirdId },
    });
    if (!thirdExists) {
      return res.status(404).json({
        status: "error",
        message: "Tercero no encontrado",
      });
    }

    const payload = normalizeThirdPayload(req.body, thirdExists.is_active);
    const validationError = await validateThirdPayload(payload, thirdId);

    if (validationError) {
      return res.status(400).json({
        status: "error",
        message: validationError,
      });
    }

    const third = await prisma.thirds.update({
      where: { id: thirdId },
      data: payload,
    });
    res.status(200).json({
      status: "success",
      message: "Tercero actualizado exitosamente",
      data: { third },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error al actualizar tercero",
    });
  }
};
const deleteThirds = async (req, res) => {
  try {
    const { id } = req.params;
    const thirdExists = await prisma.thirds.findUnique({
      where: { id: parseInt(id) },
    });
    if (!thirdExists) {
      return res.status(404).json({
        status: "error",
        message: "Tercero no encontrado",
      });
    }
    await prisma.thirds.update({
      where: { id: parseInt(id) },
      data: { is_active: false },
    });
    res.status(200).json({
      status: "success",
      message: "Tercero desactivado exitosamente",
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Error al desactivar tercero" });
  }
};

export { createThirds, getThirds, getThirdsById, updateThirds, deleteThirds };
