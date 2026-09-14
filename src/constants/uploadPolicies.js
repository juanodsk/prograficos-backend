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

export const bytesToMb = (bytes) => Math.round(bytes / (1024 * 1024));
