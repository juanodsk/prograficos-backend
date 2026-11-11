import rateLimit from "express-rate-limit";

// General: 100 peticiones por minuto por IP.
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  limit: 100,
  standardHeaders: "draft-7", // cabeceras RateLimit-* (informan al cliente)
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Demasiadas peticiones, inténtalo más tarde",
  },
});

// Estricto para login (anti fuerza bruta): 5 intentos / 5 min por IP.
export const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skipSuccessfulRequests: true, // los logins correctos NO gastan cupo
  message: {
    status: "error",
    message: "Demasiados intentos de inicio de sesión, espera unos minutos",
  },
});
