// Use-case de imágenes de troquel. Orquesta: validar -> subir a R2 -> persistir
// metadata. Los controllers quedan delgados; R2 y Prisma se usan como
// dependencias. La consistencia entre R2 y la BD se maneja aquí.
import crypto from "node:crypto";
import { prisma } from "../config/db.js";
import { putObject, deleteObject, getSignedReadUrl } from "../config/r2.js";
import {
  TROQUEL_IMAGE_POLICY as POLICY,
  bytesToMb,
} from "../constants/uploadPolicies.js";
import { HttpError } from "../utils/httpError.js";

// Subcarpeta en R2 según el tamaño del troquel (sistema de tallas S/M/L).
// Así S100, M100 y L100 quedan separados: troqueles/S/…, troqueles/M/…, etc.
const SIZE_FOLDER = {
  SMALL: "S",
  MEDIUM: "M",
  LARGE: "L",
  EXTERNAL: "E",
};

const buildKey = (troquelId, sizeFolder, mime) =>
  `${POLICY.keyPrefix}/${sizeFolder}/${troquelId}/${crypto.randomUUID()}.${POLICY.extByMime[mime]}`;

// Lista las imágenes activas con una URL firmada temporal para mostrarlas.
export const listTroquelImages = async (troquelId) => {
  const images = await prisma.troquel_Image.findMany({
    where: { troquel_id: troquelId, is_active: true },
    orderBy: { sort_order: "asc" },
    select: { id: true, storage_key: true, mime: true, size: true, sort_order: true },
  });

  return Promise.all(
    images.map(async (img) => ({
      id: img.id,
      mime: img.mime,
      size: img.size,
      sort_order: img.sort_order,
      url: await getSignedReadUrl(img.storage_key),
    })),
  );
};

export const attachTroquelImages = async (troquelId, files) => {
  if (!files?.length) {
    throw new HttpError(400, "Debe adjuntar al menos 1 imagen");
  }

  const troquel = await prisma.troqueles.findUnique({
    where: { id: troquelId },
    select: { id: true, size: true },
  });
  if (!troquel) {
    throw new HttpError(404, "Troquel no encontrado");
  }

  const sizeFolder = SIZE_FOLDER[troquel.size];
  if (!sizeFolder) {
    throw new HttpError(400, "El troquel no tiene un tamaño válido (S/M/L)");
  }

  // Validación de negocio (el backend es la autoridad; el frontend puede mentir).
  for (const file of files) {
    if (!POLICY.allowedMime.includes(file.mimetype)) {
      throw new HttpError(400, "Solo se permiten imágenes JPG o PNG");
    }
    if (file.size > POLICY.maxSizeBytes) {
      throw new HttpError(
        400,
        `Cada imagen debe pesar máximo ${bytesToMb(POLICY.maxSizeBytes)} MB`,
      );
    }
  }

  const current = await prisma.troquel_Image.count({
    where: { troquel_id: troquelId, is_active: true },
  });
  if (current + files.length > POLICY.maxFiles) {
    throw new HttpError(
      400,
      `Máximo ${POLICY.maxFiles} imágenes por troquel (ya tiene ${current})`,
    );
  }

  // 1) Sube primero a R2. 2) Persiste metadata. Si la BD falla, se borra lo
  // subido (compensación) para no dejar objetos huérfanos en R2.
  const uploaded = [];
  try {
    for (const file of files) {
      const key = buildKey(troquelId, sizeFolder, file.mimetype);
      await putObject({ key, buffer: file.buffer, contentType: file.mimetype });
      uploaded.push({ key, mime: file.mimetype, size: file.size });
    }

    await prisma.troquel_Image.createMany({
      data: uploaded.map((item, index) => ({
        troquel_id: troquelId,
        storage_key: item.key,
        mime: item.mime,
        size: item.size,
        sort_order: current + index + 1,
      })),
    });
  } catch (error) {
    await Promise.allSettled(uploaded.map((item) => deleteObject(item.key)));
    throw error;
  }

  return listTroquelImages(troquelId);
};

export const removeTroquelImage = async (troquelId, imageId) => {
  const image = await prisma.troquel_Image.findFirst({
    where: { id: imageId, troquel_id: troquelId, is_active: true },
  });
  if (!image) {
    throw new HttpError(404, "Imagen no encontrada");
  }

  // Borra primero el registro; el objeto en R2 se elimina en best-effort
  // (un huérfano en R2 es inofensivo; una referencia rota en BD, no).
  await prisma.troquel_Image.delete({ where: { id: image.id } });
  await deleteObject(image.storage_key).catch((error) => {
    console.error("No se pudo borrar el objeto en R2:", image.storage_key, error);
  });
};
