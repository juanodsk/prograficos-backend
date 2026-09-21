// Use-case del avatar de usuario. Reutiliza el gateway de R2 (config/r2.js) y la
// policy USER_AVATAR_POLICY. Bucket privado: la URL se firma al leer (TTL 7 días).
import crypto from "node:crypto";
import { prisma } from "../config/db.js";
import { putObject, deleteObject, getSignedReadUrl } from "../config/r2.js";
import {
  USER_AVATAR_POLICY as POLICY,
  bytesToMb,
} from "../constants/uploadPolicies.js";
import { HttpError } from "../utils/httpError.js";

const AVATAR_URL_TTL = 60 * 60 * 24 * 7; // 7 días (máximo de una URL firmada)

const buildKey = (userId, mime) =>
  `${POLICY.keyPrefix}/${userId}/${crypto.randomUUID()}.${POLICY.extByMime[mime]}`;

// URL firmada para mostrar el avatar (o null si el usuario no tiene).
export const buildUserAvatarUrl = (avatarKey) =>
  avatarKey ? getSignedReadUrl(avatarKey, AVATAR_URL_TTL) : Promise.resolve(null);

// Agrega avatar_url (firmada) a un usuario ya consultado con avatar_key.
export const attachAvatarUrl = async (user) => {
  if (!user) return user;
  return { ...user, avatar_url: await buildUserAvatarUrl(user.avatar_key) };
};

export const attachAvatarUrls = (users = []) =>
  Promise.all(users.map((user) => attachAvatarUrl(user)));

export const uploadUserAvatar = async (userId, file) => {
  if (!file) {
    throw new HttpError(400, "Debe adjuntar una imagen");
  }
  if (!POLICY.allowedMime.includes(file.mimetype)) {
    throw new HttpError(400, "Solo se permiten imágenes JPG, PNG o WEBP");
  }
  if (file.size > POLICY.maxSizeBytes) {
    throw new HttpError(
      400,
      `La imagen debe pesar máximo ${bytesToMb(POLICY.maxSizeBytes)} MB`,
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, avatar_key: true },
  });
  if (!user) {
    throw new HttpError(404, "Usuario no encontrado");
  }

  const previousKey = user.avatar_key;
  const key = buildKey(userId, file.mimetype);

  // 1) Sube a R2. 2) Persiste la key. Si la BD falla, borra lo subido.
  await putObject({ key, buffer: file.buffer, contentType: file.mimetype });
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { avatar_key: key },
    });
  } catch (error) {
    await deleteObject(key).catch(() => {});
    throw error;
  }

  // Borra el avatar anterior (best-effort) para no acumular basura en R2.
  if (previousKey && previousKey !== key) {
    await deleteObject(previousKey).catch((error) =>
      console.error("No se pudo borrar el avatar anterior:", previousKey, error),
    );
  }

  return { avatar_key: key, avatar_url: await buildUserAvatarUrl(key) };
};

// Quita la foto de perfil: borra el objeto en R2 y limpia avatar_key. El usuario
// vuelve al fallback (icono). Evita fotos huérfanas en R2.
export const removeUserAvatar = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, avatar_key: true },
  });
  if (!user) {
    throw new HttpError(404, "Usuario no encontrado");
  }

  if (user.avatar_key) {
    await deleteObject(user.avatar_key).catch((error) =>
      console.error("No se pudo borrar el avatar en R2:", user.avatar_key, error),
    );
    await prisma.user.update({
      where: { id: userId },
      data: { avatar_key: null },
    });
  }

  return { avatar_key: null, avatar_url: null };
};
