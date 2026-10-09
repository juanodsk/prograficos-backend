// Fuente de verdad de la seguridad (estilo "claims/policies").
// Los PERMISOS los define el código (aquí); el admin solo los ASIGNA a roles.
// El sync idempotente (bootstrap) crea/actualiza estos registros en la BD.

// Roles base del sistema (is_system: no se pueden eliminar).
export const SYSTEM_ROLES = [
  { name: "ADMIN", label: "Administrador", description: "Acceso total al sistema" },
  { name: "SUPERVISOR", label: "Supervisor", description: "Gestión operativa y de catálogos" },
  { name: "OPERATOR", label: "Operario", description: "Operación de órdenes y procesos" },
  { name: "CUSTOMER", label: "Cliente", description: "Portal del cliente" },
];

// Catálogo de permisos por módulo. `key` es el claim que se verifica.
export const PERMISSIONS = [
  // Usuarios / seguridad
  { key: "users:view", module: "Usuarios", label: "Ver usuarios" },
  { key: "users:create", module: "Usuarios", label: "Crear usuarios" },
  { key: "users:update", module: "Usuarios", label: "Editar usuarios" },
  { key: "users:delete", module: "Usuarios", label: "Eliminar usuarios" },
  { key: "security:manage", module: "Seguridad", label: "Administrar roles y permisos" },

  // Terceros
  { key: "thirds:view", module: "Terceros", label: "Ver terceros" },
  { key: "thirds:create", module: "Terceros", label: "Crear terceros" },
  { key: "thirds:update", module: "Terceros", label: "Editar terceros" },
  { key: "thirds:delete", module: "Terceros", label: "Eliminar terceros" },

  // Productos
  { key: "products:view", module: "Productos", label: "Ver productos" },
  { key: "products:create", module: "Productos", label: "Crear productos" },
  { key: "products:update", module: "Productos", label: "Editar productos" },
  { key: "products:delete", module: "Productos", label: "Eliminar productos" },

  // Troqueles
  { key: "troqueles:view", module: "Troqueles", label: "Ver troqueles" },
  { key: "troqueles:create", module: "Troqueles", label: "Crear troqueles" },
  { key: "troqueles:update", module: "Troqueles", label: "Editar troqueles" },
  { key: "troqueles:delete", module: "Troqueles", label: "Eliminar troqueles" },
  { key: "troqueles:download", module: "Troqueles", label: "Descargar imágenes de troqueles" },

  // Catálogos (medidas, formatos, papel, procesos, maquinaria)
  { key: "catalogs:view", module: "Catálogos", label: "Ver catálogos" },
  { key: "catalogs:manage", module: "Catálogos", label: "Administrar catálogos" },

  // Órdenes de producción
  { key: "orders:view", module: "Órdenes", label: "Ver órdenes" },
  { key: "orders:create", module: "Órdenes", label: "Crear órdenes" },
  { key: "orders:update", module: "Órdenes", label: "Editar órdenes" },
  { key: "orders:delete", module: "Órdenes", label: "Eliminar órdenes" },
  { key: "orders:operate", module: "Órdenes", label: "Iniciar/finalizar procesos" },
  { key: "orders:finish", module: "Órdenes", label: "Terminar órdenes" },
  { key: "monitor:view", module: "Órdenes", label: "Ver monitor de planta" },
  { key: "audit:view", module: "Órdenes", label: "Ver auditoría" },
];

// Matriz por defecto rol -> permisos. Reproduce el acceso actual del sistema.
// ADMIN es superusuario (bypass en el middleware): no necesita listarse.
export const DEFAULT_ROLE_PERMISSIONS = {
  SUPERVISOR: [
    "users:view", "users:create", "users:update", "users:delete",
    "thirds:view", "thirds:create", "thirds:update", "thirds:delete",
    "products:view", "products:create", "products:update", "products:delete",
    "troqueles:view", "troqueles:create", "troqueles:update", "troqueles:delete",
    "troqueles:download",
    "catalogs:view", "catalogs:manage",
    "orders:view", "orders:create", "orders:update", "orders:delete",
    "orders:operate", "orders:finish", "monitor:view", "audit:view",
  ],
  OPERATOR: [
    "thirds:view",
    "products:view",
    "troqueles:view",
    "catalogs:view",
    "orders:view", "orders:create", "orders:update",
    "orders:operate", "monitor:view",
  ],
  CUSTOMER: [],
};

export const ADMIN_ROLE_NAME = "ADMIN";

// Lectura de catálogos (datos de referencia): además de quien administra o ve
// catálogos, debe poder leerlos cualquiera del flujo de órdenes, porque ver /
// crear / editar / operar una orden requiere consultar máquinas, medidas,
// formatos, tipos de papel y procesos. La escritura sigue exigiendo catalogs:manage.
const ORDER_FLOW_KEYS = [
  "orders:view",
  "orders:create",
  "orders:update",
  "orders:operate",
];

export const CATALOG_READ_KEYS = [
  "catalogs:view",
  "catalogs:manage",
  ...ORDER_FLOW_KEYS,
];

// Igual criterio para terceros, productos y troqueles: su lectura la necesita
// el flujo de órdenes (un pedido referencia cliente, producto y troquel), así
// que leer está permitido a quien ve/gestiona el módulo o trabaja órdenes.
// Escritura: la key específica (x:create / x:update / x:delete).
export const THIRDS_READ_KEYS = [
  "thirds:view",
  "thirds:create",
  "thirds:update",
  ...ORDER_FLOW_KEYS,
];

export const PRODUCTS_READ_KEYS = [
  "products:view",
  "products:create",
  "products:update",
  ...ORDER_FLOW_KEYS,
];

export const TROQUELES_READ_KEYS = [
  "troqueles:view",
  "troqueles:create",
  "troqueles:update",
  ...ORDER_FLOW_KEYS,
];

// Lectura de una orden / sus procesos: cualquiera del flujo de órdenes.
export const ORDER_READ_KEYS = [
  "orders:view",
  "orders:create",
  "orders:update",
  "orders:operate",
  "orders:finish",
  "monitor:view",
];
