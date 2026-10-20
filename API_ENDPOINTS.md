# API Endpoints

Referencia rápida de los endpoints del backend `prograficos-backend`.
Última actualización verificada contra el código: **2026-10-20**.

## Base URL

- Local: `http://localhost:5001`
- Producción detrás de proxy: la API suele publicarse con un prefijo (p. ej. `/prograficos`). Las rutas de este documento son las rutas internas; antepón el prefijo del proxy si aplica.

## Autenticación

- Casi todos los endpoints requieren token (`verifyToken`).
- El token se acepta en:
  - cookie `token`
  - header `Authorization: Bearer <token>`
- Un usuario inactivo no puede autenticarse ni conservar acceso con un token previo.

## Autorización: permisos (RBAC)

Desde 2026-10 la autorización es **por permisos (claims)**, no por rol fijo:

- Los permisos (`key`) son la fuente de verdad del código en `src/constants/permissions.js`. El administrador solo **asigna** permisos a roles; no crea permisos.
- Los roles son una **tabla en BD** (`role`), con `User.role_id` (FK) y una relación N-N rol↔permiso. Roles de sistema: `ADMIN`, `SUPERVISOR`, `OPERATOR`, `CUSTOMER` (este último reservado para el futuro portal del cliente).
- **ADMIN** es superusuario: hace bypass de la verificación de permisos.
- Un bootstrap idempotente (`syncSecurity`) crea/actualiza los permisos en cada arranque y asigna la matriz por defecto a roles que aún no tienen permisos. **No reasigna** permisos a un rol que ya los tiene: los permisos nuevos se asignan manualmente en staging/prod tras el deploy.

Middlewares (en `src/middlewares/role.middleware.js`):

- `requirePermission("x:y")` — exige ese permiso exacto.
- `requireAnyPermission("a", "b", ...)` — exige al menos uno.
- `requireAdmin` — solo rol ADMIN (zona de Seguridad: usuarios, roles).

### Lectura compartida por el flujo de órdenes

Crear/ver/editar/operar una orden necesita leer catálogos, terceros, productos y troqueles. Por eso la **lectura** de esos módulos se permite a quien ve/gestiona el módulo **o** trabaja órdenes, mediante listas de claves (`*_READ_KEYS`). La **escritura** sigue exigiendo la key específica (`x:create`/`x:update`/`x:delete` o `catalogs:manage`).

- `CATALOG_READ_KEYS` = `catalogs:view`, `catalogs:manage`, `orders:view/create/update/operate`
- `THIRDS_READ_KEYS` = `thirds:view/create/update` + flujo de órdenes
- `PRODUCTS_READ_KEYS` = `products:view/create/update` + flujo de órdenes
- `TROQUELES_READ_KEYS` = `troqueles:view/create/update` + flujo de órdenes
- `ORDER_READ_KEYS` = `orders:view/create/update/operate/finish`, `monitor:view`

## Query params comunes

- `?onlyActive=true` trae solo registros activos (catálogos y listados).
- Listados con paginación: `page`, `pageSize`, `search`, `sortBy`, `sortDirection`.

---

## Auth

| Método | Ruta | Autorización |
| --- | --- | --- |
| POST | `/auth/login` | Público |
| POST | `/auth/logout` | Público |
| GET | `/auth/profile` | `verifyToken` |

> No existe `POST /auth/register`. El auto-registro público fue retirado: los usuarios se crean solo desde `POST /users/create` (ADMIN).

`POST /auth/login` body:

```json
{ "email": "juan@example.com", "password": "123456" }
```

## Roles y permisos (Seguridad)

Todas requieren `verifyToken` + `requireAdmin`.

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/roles/permissions` | Catálogo de permisos disponibles (agrupados por módulo). |
| GET | `/roles/` | Lista de roles con sus permisos. |
| GET | `/roles/:id` | Detalle de un rol. |
| POST | `/roles/` | Crear rol. |
| PUT | `/roles/:id/permissions` | Reemplazar los permisos asignados a un rol. |
| PUT | `/roles/:id` | Editar rol (label/description; roles de sistema no se eliminan). |
| DELETE | `/roles/:id` | Eliminar rol (no de sistema). |

## Users (Seguridad)

Todas requieren `verifyToken` + `requireAdmin`, salvo `/operators`.

| Método | Ruta | Autorización |
| --- | --- | --- |
| GET | `/users/operators` | `verifyToken` + rol `ADMIN`/`SUPERVISOR` (para asignar operarios a maquinaria/procesos). |
| GET | `/users/` | ADMIN |
| GET | `/users/check-username` | ADMIN |
| POST | `/users/create` | ADMIN |
| PUT | `/users/update/:id` | ADMIN |
| DELETE | `/users/delete/:id` | ADMIN (borrado lógico) |
| POST | `/users/:id/avatar` | ADMIN (`multipart/form-data`, campo `file`) |
| DELETE | `/users/:id/avatar` | ADMIN |
| GET | `/users/:id` | ADMIN |

`POST /users/create` body:

```json
{
  "name": "Juan",
  "surename": "Pérez",
  "email": "juan@example.com",
  "password": "123456",
  "role_id": 3,
  "is_active": true
}
```

## Formats (Catálogo)

| Método | Ruta | Autorización |
| --- | --- | --- |
| GET | `/formats/` | `requireAnyPermission(...CATALOG_READ_KEYS)` |
| GET | `/formats/:id` | `...CATALOG_READ_KEYS` |
| POST | `/formats/` | `catalogs:manage` |
| PUT | `/formats/:id` | `catalogs:manage` |
| DELETE | `/formats/:id` | `catalogs:manage` (borrado lógico) |

## Measures (Catálogo)

Mismo patrón que Formats: GET con `...CATALOG_READ_KEYS`; POST/PUT/DELETE con `catalogs:manage`.
Body incluye `width`, `height`, `format_id`, `is_active`.

## Paper Types (Catálogo)

| Método | Ruta | Autorización |
| --- | --- | --- |
| GET | `/paper_types/` | `...CATALOG_READ_KEYS` |
| GET | `/paper_types/:id` | `...CATALOG_READ_KEYS` |
| POST | `/paper_types/` | `catalogs:manage` |
| PUT | `/paper_types/:id` | `catalogs:manage` |
| DELETE | `/paper_types/:id` | `catalogs:manage` (borrado lógico) |

Body:

```json
{
  "name": "Propalcote",
  "description": "Couché",
  "grammage": 300,
  "service_line_id": 1,
  "is_active": true,
  "suppliers": [{ "third_id": 2, "purchase_price": 1450.5 }]
}
```

Notas:

- `service_line_id` es **obligatorio**: un tipo de papel pertenece a **una** línea de servicio activa.
- `grammage` obligatorio; `suppliers` obligatorio (≥1), cada uno tercero activo `PROVEEDOR`, sin `third_id` repetido.
- El listado admite filtro por línea (`?service_line_id=`) y orden por `service_line`.

## Machinery (Catálogo)

| Método | Ruta | Autorización |
| --- | --- | --- |
| GET | `/machinery/` | `...CATALOG_READ_KEYS` |
| GET | `/machinery/validate-reference` | `catalogs:manage` |
| GET | `/machinery/:id` | `...CATALOG_READ_KEYS` |
| POST | `/machinery/` | `catalogs:manage` |
| PUT | `/machinery/:id` | `catalogs:manage` |
| DELETE | `/machinery/:id` | `catalogs:manage` (borrado lógico) |

Tipos: `PREPRENSA`, `GUILLOTINA`, `IMPRESORA_OFFSET`, `IMPRESORA_DIGITAL`, `PLASTIFICADORA`, `LAMINADORA`, `BARNIZADORA`, `ESTAMPADORA`, `TROQUELADORA`, `PEGADORA`, `DOBLADORA`, `EMPAQUE`, `OTRA`.

## Service Lines (Líneas de servicio · Catálogo)

Catálogo transversal que da flexibilidad a los tipos de servicio de la empresa (Offset, Cartón Microcorrugado, Serigrafía, …).

| Método | Ruta | Autorización |
| --- | --- | --- |
| GET | `/service-lines/` | `verifyToken` (dato de referencia usado por varios módulos) |
| GET | `/service-lines/:id` | `verifyToken` |
| POST | `/service-lines/` | `catalogs:manage` |
| PUT | `/service-lines/:id` | `catalogs:manage` |
| DELETE | `/service-lines/:id` | `catalogs:manage` (borrado físico) |

> La **lectura** se deja abierta a cualquier usuario autenticado porque líneas de servicio es dato de referencia que consultan terceros, papel, productos, procesos y el formulario de órdenes; la **escritura** exige `catalogs:manage`.

Body:

```json
{ "name": "Serigrafía", "description": "Línea de serigrafía", "is_active": true }
```

Notas:

- `name` único; `?onlyActive=true` filtra activas.

## Thirds (Terceros)

| Método | Ruta | Autorización |
| --- | --- | --- |
| GET | `/thirds/` | `...THIRDS_READ_KEYS` |
| GET | `/thirds/:id` | `...THIRDS_READ_KEYS` |
| POST | `/thirds/` | `thirds:create` |
| PUT | `/thirds/:id` | `thirds:update` |
| DELETE | `/thirds/:id` | `thirds:delete` (borrado lógico) |

Body:

```json
{
  "name": "Cliente Demo",
  "email": "cliente@example.com",
  "address": "Calle 123",
  "type_person": "CLIENTE",
  "person_type": "JURIDICA",
  "document_type": "NIT",
  "document_number": "900123456",
  "company_name": "Empresa SAS",
  "prefix": "EMP",
  "service_line_ids": [1, 2],
  "is_active": true
}
```

Notas:

- `type_person`: `CLIENTE`, `PROVEEDOR` u `OTROS`.
- `service_line_ids` es **obligatorio** (≥1): un tercero (cliente/proveedor) pertenece a 1 o varias líneas de servicio (relación m2m). Todas deben existir y estar activas.
- `prefix` aplica **solo a CLIENTE** (mayúsculas alfanumérico, máx 4, único); para otros tipos se ignora/limpia.
- Email y la combinación tipo/número de documento no pueden duplicarse.

## Products (Productos)

| Método | Ruta | Autorización |
| --- | --- | --- |
| GET | `/products/customers` | `...PRODUCTS_READ_KEYS` (clientes con productos, para filtros) |
| GET | `/products/check-code` | `products:create` o `products:update` (valida unicidad de código por cliente) |
| GET | `/products/:id` | `...PRODUCTS_READ_KEYS` |
| GET | `/products/` | `...PRODUCTS_READ_KEYS` |
| POST | `/products/` | `products:create` |
| PUT | `/products/:id` | `products:update` |
| DELETE | `/products/:id` | `products:delete` (borrado lógico) |

Body:

```json
{
  "name": "Caja Cliente X",
  "troquel_id": 3,
  "third_id": 2,
  "service_line_id": 1,
  "code": "EMP1",
  "sale_price": 15000,
  "is_active": true
}
```

Notas:

- `Product` relaciona directamente `Thirds` (cliente) con `Troqueles`.
- `troquel_id`, `third_id` y `service_line_id` son **obligatorios** y deben referenciar registros activos.
- El **tercero debe pertenecer a la línea** indicada (se valida en backend).
- `code` opcional = prefijo del cliente + número entero (único por cliente). `name` y `sale_price` opcionales.
- El listado admite filtro por línea (`?service_line_id=`) y orden por `service_line`.

## Troqueles

| Método | Ruta | Autorización |
| --- | --- | --- |
| GET | `/troqueles/` | `...TROQUELES_READ_KEYS` |
| GET | `/troqueles/:id` | `...TROQUELES_READ_KEYS` |
| POST | `/troqueles/` | `troqueles:create` (`multipart/form-data`) |
| PUT | `/troqueles/:id` | `troqueles:update` (`multipart/form-data`) |
| DELETE | `/troqueles/:id` | `troqueles:delete` (borrado lógico) |
| GET | `/troqueles/:id/images` | `...TROQUELES_READ_KEYS` |
| POST | `/troqueles/:id/images` | `troqueles:create` o `troqueles:update` (sube imágenes) |
| DELETE | `/troqueles/:id/images/:imageId` | `troqueles:create` o `troqueles:update` |

Campos POST/PUT: `code` (req), `elaboration_date` (opc), `size` (req en create), `is_active` (opc), `file` (archivo; opcional en update). Las imágenes de referencia se guardan por carpeta según tamaño (S/M/L) en almacenamiento R2.

## Processes (Procesos · Catálogo)

| Método | Ruta | Autorización |
| --- | --- | --- |
| GET | `/processes/` | `...CATALOG_READ_KEYS` |
| GET | `/processes/validate-field-key` | `catalogs:manage` (unicidad de `key` de campo dinámico) |
| PATCH | `/processes/reorder` | `catalogs:manage` (actualiza `order`) |
| GET | `/processes/:id` | `...CATALOG_READ_KEYS` |
| POST | `/processes/` | `catalogs:manage` |
| PUT | `/processes/:id` | `catalogs:manage` |
| DELETE | `/processes/:id` | `catalogs:manage` (borrado lógico) |

Body:

```json
{
  "name": "Troquelado",
  "order": 4,
  "category": "TROQUELADO",
  "service_line_ids": [1, 2],
  "is_active": true,
  "field_definitions": [
    { "key": "color", "label": "Color", "field_type": "TEXT", "is_required": false, "sort_order": 1, "options": null }
  ]
}
```

Notas:

- `service_line_ids` es **obligatorio** (≥1): un proceso pertenece a 1 o varias líneas (m2m), de modo que un mismo proceso (p. ej. Troquelado) se reutiliza en varias líneas sin duplicarlo.
- `field_definitions` puede ir vacío; si un campo ya existe conviene enviar su `id`. Un campo con datos históricos no se elimina.
- `category`: `PREPRENSA`, `CORTE`, `IMPRESION`, `ACABADO`, `TROQUELADO`, `PEGADO`, `EMPAQUE`, `OTRO`.

## Orders (Órdenes)

| Método | Ruta | Autorización |
| --- | --- | --- |
| POST | `/order/` | `orders:create` o `orders:duplicate` |
| GET | `/order/` | `...ORDER_READ_KEYS` |
| GET | `/order/board` | `monitor:view` (tablero/monitor de planta) |
| GET | `/order/audit` | `audit:view` (órdenes cerradas con trazabilidad) |
| GET | `/order/:id` | `...ORDER_READ_KEYS` |
| PUT | `/order/:id` | `orders:update` |
| DELETE | `/order/:id` | `orders:delete` (borrado lógico) |
| PATCH | `/order/:id/finish` | `orders:finish` (marca `TERMINADO`) |

Body (POST/PUT):

```json
{
  "date_delivery_estimated": "2026-04-10",
  "calculation_mode": "TOTAL_REQUIRED",
  "amount_sheets": 1500,
  "amount_sheets_additional": 0,
  "cavities": 1,
  "total_estimated": 1500,
  "measure_id": 1,
  "paper_type_id": 2,
  "troquel_id": 3,
  "product_id": 4,
  "processes": [1, 2, 3],
  "field_values": []
}
```

Notas:

- La **línea de servicio NO se envía ni se persiste** en la orden: en el formulario sirve solo para filtrar cliente, productos, tipos de papel y procesos activos de esa línea. La línea efectiva de una orden se deriva de `product.service_line` (una orden = una línea).
- `calculation_mode`: `TOTAL_REQUIRED` o `SHEETS_REQUIRED`.
- `product.troquel_id` debe coincidir con `troquel_id`. `processes` lleva ≥1 proceso.
- Solo se puede editar si ningún proceso fue iniciado.

## Order Processes (avance en planta)

| Método | Ruta | Autorización |
| --- | --- | --- |
| GET | `/order-processes/order/:orderId` | `...ORDER_READ_KEYS` |
| GET | `/order-processes/:id` | `...ORDER_READ_KEYS` |
| PATCH | `/order-processes/:id/start` | `orders:operate` |
| PATCH | `/order-processes/:id/finish` | `orders:operate` |
| PATCH | `/order-processes/:id/edit` | `orders:edit_processes` (corregir avance de un proceso terminado; recalcula en cascada) |

`start` body:

```json
{ "machinery_id": 1, "observations": "Arranque correcto", "field_values": [{ "field_definition_id": 10, "value": "Azul" }] }
```

`finish` body:

```json
{ "quantity_delivered": 1490, "quantity_damaged": 10 }
```

Notas:

- `measure_cutting_id` se deriva de la orden; no se envía.
- Solo se inicia si el proceso anterior ya terminó; solo se finaliza si está `EN_PROCESO`.
- Tras iniciar, los datos de entrada quedan bloqueados (salvo corrección vía `/edit` con `orders:edit_processes`).

---

## Roles y permisos del sistema

Roles de sistema (tabla `role`): `ADMIN`, `SUPERVISOR`, `OPERATOR`, `CUSTOMER` (reservado).

Permisos (claims) por módulo — fuente: `src/constants/permissions.js`:

- Usuarios/Seguridad: `users:view/create/update/delete`, `security:manage`
- Terceros: `thirds:view/create/update/delete`
- Productos: `products:view/create/update/delete`
- Troqueles: `troqueles:view/create/update/delete/download`
- Catálogos (medidas, formatos, papel, procesos, maquinaria, **líneas de servicio**): `catalogs:view`, `catalogs:manage`
- Órdenes: `orders:view/create/update/delete/operate/finish/duplicate/print/print-massive/edit_processes`, `monitor:view`, `audit:view`

Matriz por defecto: **ADMIN** todo (bypass); **SUPERVISOR** gestión operativa y de catálogos completa; **OPERATOR** lectura de catálogos/terceros/productos/troqueles + `orders:view/create/update/operate` + `monitor:view`; **CUSTOMER** sin permisos (reservado).

## Estados comunes

- **Orden**: `PENDIENTE`, `EN_PROCESO`, `TERMINADO`, `ENTREGADO`
- **Proceso de orden**: `PENDIENTE`, `EN_PROCESO`, `TERMINADO`
