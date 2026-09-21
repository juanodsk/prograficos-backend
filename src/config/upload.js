// Middleware de multer para imágenes de troquel. Guarda en memoria (buffer)
// para pasar directo a R2 sin archivos temporales. Traduce los errores de
// multer (tamaño/cantidad/tipo) a la respuesta JSON estándar del proyecto.
import multer from "multer";
import {
  TROQUEL_IMAGE_POLICY as POLICY,
  USER_AVATAR_POLICY as AVATAR_POLICY,
  bytesToMb,
} from "../constants/uploadPolicies.js";

const multerTroquelImages = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: POLICY.maxSizeBytes, files: POLICY.maxFiles },
  fileFilter: (_req, file, cb) => {
    if (POLICY.allowedMime.includes(file.mimetype)) return cb(null, true);
    cb(new Error("Solo se permiten imágenes JPG o PNG"));
  },
}).array("images", POLICY.maxFiles);

export const uploadTroquelImages = (req, res, next) => {
  multerTroquelImages(req, res, (err) => {
    if (!err) return next();

    let message = err.message || "Error al procesar las imágenes";
    if (err.code === "LIMIT_FILE_SIZE") {
      message = `Cada imagen debe pesar máximo ${bytesToMb(POLICY.maxSizeBytes)} MB`;
    } else if (err.code === "LIMIT_FILE_COUNT" || err.code === "LIMIT_UNEXPECTED_FILE") {
      message = `Máximo ${POLICY.maxFiles} imágenes por troquel`;
    }

    return res.status(400).json({ status: "error", message });
  });
};

// Avatar de usuario: 1 sola imagen en memoria.
const multerUserAvatar = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: AVATAR_POLICY.maxSizeBytes, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (AVATAR_POLICY.allowedMime.includes(file.mimetype)) return cb(null, true);
    cb(new Error("Solo se permiten imágenes JPG, PNG o WEBP"));
  },
}).single("avatar");

export const uploadUserAvatar = (req, res, next) => {
  multerUserAvatar(req, res, (err) => {
    if (!err) return next();

    let message = err.message || "Error al procesar la imagen";
    if (err.code === "LIMIT_FILE_SIZE") {
      message = `La imagen debe pesar máximo ${bytesToMb(AVATAR_POLICY.maxSizeBytes)} MB`;
    }

    return res.status(400).json({ status: "error", message });
  });
};
