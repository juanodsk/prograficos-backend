// Reglas de subida por tipo de recurso (Policy objects).
// Escalar a otros archivos (ej. PDF) = agregar una nueva policy aquí,
// sin tocar el gateway de R2 ni el service.
export const TROQUEL_IMAGE_POLICY = {
  keyPrefix: "troqueles",
  maxFiles: 3,
  maxSizeBytes: 3 * 1024 * 1024, // 3 MB
  allowedMime: ["image/jpeg", "image/png"],
  extByMime: {
    "image/jpeg": "jpg",
    "image/png": "png",
  },
};

// Avatar de usuario: 1 sola imagen, máx 1 MB, guardada en la carpeta usuarios/.
// La imagen llega ya recortada y optimizada desde el frontend.
export const USER_AVATAR_POLICY = {
  keyPrefix: "usuarios",
  maxFiles: 1,
  maxSizeBytes: 1 * 1024 * 1024, // 1 MB
  allowedMime: ["image/jpeg", "image/png", "image/webp"],
  extByMime: {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  },
};

export const bytesToMb = (bytes) => Math.round(bytes / (1024 * 1024));
