export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Acceso denegado. Permisos insuficientes.`,
      });
    }
    next();
  };
};

// Policy por permiso (claim). ADMIN es superusuario (bypass).
// Uso: requirePermission("orders:finish")
export const requirePermission = (...requiredKeys) => {
  return (req, res, next) => {
    if (req.user?.isAdmin) return next();
    const granted = new Set(req.user?.permissions || []);
    const ok = requiredKeys.every((key) => granted.has(key));
    if (!ok) {
      return res.status(403).json({
        message: "Acceso denegado. Permisos insuficientes.",
      });
    }
    next();
  };
};

// Variante OR: basta con tener uno de los permisos.
export const requireAnyPermission = (...keys) => {
  return (req, res, next) => {
    if (req.user?.isAdmin) return next();
    const granted = new Set(req.user?.permissions || []);
    if (!keys.some((key) => granted.has(key))) {
      return res.status(403).json({
        message: "Acceso denegado. Permisos insuficientes.",
      });
    }
    next();
  };
};

// Solo ADMIN (para la zona de Seguridad).
export const requireAdmin = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: "Solo un administrador puede acceder." });
  }
  next();
};
