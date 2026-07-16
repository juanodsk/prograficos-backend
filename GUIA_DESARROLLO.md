# Guía de desarrollo y buenas prácticas

Esta guía establece las reglas de trabajo para `backend-prograficos`. Su objetivo es preservar las reglas del dominio, reducir inconsistencias y permitir que el backend evolucione sin romper clientes, datos históricos ni despliegues.

Las palabras **DEBE**, **NO DEBE**, **DEBERÍA** y **PUEDE** expresan el nivel de obligatoriedad. Las reglas aplican a código nuevo y a código existente que sea modificado. No obligan a reescribir todo el proyecto en una sola entrega.

## 1. Principios de desarrollo

1. **El código ejecutable es la fuente de verdad actual.** Para rutas se revisan `src/server.js`, `src/routes/` y luego los controladores. Para datos se revisan `prisma/schema.prisma` y las migraciones.
2. **La compatibilidad es explícita.** No se renombra una ruta, campo JSON, enum, evento o columna sin estrategia de migración.
3. **Las reglas de negocio viven en el backend.** El frontend puede orientar al usuario, pero el servidor vuelve a validar permisos, relaciones, estados y cantidades.
4. **Una transacción protege una unidad de negocio.** Si una operación modifica varias tablas que deben quedar consistentes, se usa `prisma.$transaction`.
5. **El borrado lógico conserva historia.** No se eliminan físicamente entidades relacionadas con producción salvo una migración o tarea administrativa diseñada para ello.
6. **Seguridad por defecto.** Todo endpoint nuevo es privado hasta justificar lo contrario y todo permiso se verifica en el servidor.
7. **Los cambios quedan verificables.** Cada entrega incluye pruebas o, mientras se instala la suite, los comandos de validación aplicables y una descripción honesta de lo no cubierto.
8. **Documentación y código cambian juntos.** Un contrato modificado sin documentación actualizada no está terminado.

## 2. Estado arquitectónico actual

La aplicación usa una arquitectura por capas:

```text
HTTP / Socket.IO
      │
      ▼
src/server.js
      │
      ▼
routes ──► middlewares de autenticación/autorización
      │
      ▼
controllers
      ├── validación y normalización
      ├── reglas de negocio
      ├── consultas/transacciones Prisma
      └── construcción de respuesta y eventos
      │
      ▼
Prisma Client ──► PostgreSQL
```

Fortalezas actuales:

- Separación clara de routers, controladores, middlewares y utilidades.
- Prisma centralizado en `src/config/db.js`.
- Autenticación JWT con comprobación de usuario activo en cada petición.
- Autorización declarativa por roles en routers.
- Uso de transacciones en operaciones compuestas importantes.
- Borrado lógico extendido a los catálogos principales.
- Paginación, búsquedas y ordenamiento reutilizables.
- Eventos de producción centralizados mediante `emitProductionChange`.

Límites actuales:

- Los controladores grandes mezclan transporte, negocio y persistencia; `order.controller.js` supera las 1200 líneas.
- No existe capa formal de servicios, validadores ni repositorios.
- No hay middleware global de errores, handler 404, health check ni cierre para `SIGINT`.
- No hay suite de pruebas, lint, formatter, OpenAPI ni CI.
- Los contratos de respuesta y las convenciones de rutas no son uniformes.
- Hay código heredado de `product_customer` que ya no corresponde al esquema.

## 3. Dirección arquitectónica

### 3.1 Cambios pequeños en módulos existentes

Un arreglo acotado DEBE conservar la estructura actual para evitar refactors colaterales. Aun así:

- El router solo declara método, path, middlewares y handler.
- El controlador coordina la petición y respuesta.
- La lógica reutilizable DEBE extraerse a una función pura o servicio.
- Las consultas complejas repetidas DEBEN centralizarse.
- No se duplican utilidades ya existentes en `src/utils/`.

### 3.2 Funcionalidad nueva o refactor grande

Un dominio nuevo o una ampliación con varias reglas DEBERÍA adoptar organización por módulo:

```text
src/modules/<recurso>/
├── <recurso>.routes.js
├── <recurso>.controller.js
├── <recurso>.service.js
├── <recurso>.validation.js
├── <recurso>.repository.js       # Solo si aporta valor real
├── <recurso>.mapper.js           # Solo si existe transformación de contrato
└── <recurso>.test.js
```

Responsabilidades:

| Pieza | Responsabilidad | No debe hacer |
| --- | --- | --- |
| Route | Path, verbo, autenticación, autorización, upload y validación de transporte. | Consultar Prisma o contener reglas de negocio. |
| Controller | Leer datos ya validados, llamar al servicio y enviar la respuesta. | Implementar flujos extensos o repetir validaciones. |
| Service | Reglas del dominio, transiciones, transacciones y orquestación. | Depender directamente de `req` o `res`. |
| Repository | Consultas complejas o reutilizables. | Ocultar reglas de negocio. |
| Validation | Esquemas de params, query y body; coerción controlada. | Consultar o modificar la base de datos. |
| Mapper | Contrato de salida y protección de campos internos. | Ejecutar lógica del dominio. |

No se crea una capa vacía por ceremonia. Un CRUD pequeño puede mantener route + controller si sigue siendo legible y está probado.

### 3.3 Composición de la aplicación

Como refactor futuro, se DEBERÍA separar:

- `src/app.js`: construcción de Express, middlewares y rutas, sin escuchar puerto.
- `src/server.js`: servidor HTTP, Socket.IO, conexión a base de datos y señales del proceso.

Esto permite probar la app con un cliente HTTP sin iniciar un proceso real.

## 4. Nomenclatura

El repositorio contiene nombres históricos mezclados. No se hace un cambio masivo sin migración; estas reglas rigen para código nuevo.

| Elemento | Convención | Ejemplo |
| --- | --- | --- |
| Variables y funciones JS | `camelCase` | `validateOrderPayload` |
| Booleanos | Prefijo `is`, `has`, `can` o `should` | `isActive`, `hasStartedProcesses` |
| Constantes | `UPPER_SNAKE_CASE` si son valores fijos exportados | `MACHINERY_TYPES` |
| Clases y tipos | `PascalCase` | `DomainError` |
| Archivos de módulo | singular y `kebab-case` + sufijo | `paper-type.service.js` |
| Carpetas de dominio | sustantivo plural en `kebab-case` | `order-processes/` |
| Funciones controller | verbo + recurso | `createOrder`, `getOrderById` |
| Rutas nuevas | recursos plurales, minúsculas y `kebab-case` | `/api/v1/paper-types` |
| Query params nuevos | `camelCase` | `pageSize`, `sortDirection` |
| Enums | tipo `PascalCase`, valores `UPPER_SNAKE_CASE` | `OrderStatus.TERMINADO` |
| Eventos | dominio + acción en pasado lógico | `order:created` |

### Compatibilidad con nombres actuales

- Se mantienen por ahora `/paper_types`, `/order` y los paths especiales de usuarios.
- Se mantienen campos JSON y Prisma en `snake_case` donde ya forman parte del contrato (`is_active`, `paper_type_id`, etc.).
- Los modelos Prisma heredados con guion bajo no se renombran sin migración y prueba de todos sus usos.
- Para modelos nuevos, se prefiere API Prisma en `PascalCase`/`camelCase` y tablas/columnas PostgreSQL en `snake_case` mediante `@map` y `@@map`.
- Una API futura versionada DEBERÍA normalizar rutas sin cambiar silenciosamente la API actual.

## 5. Carpetas e imports

- Todos los imports locales DEBEN incluir extensión `.js`, porque el proyecto usa ES Modules.
- Se prefieren imports relativos cortos dentro de un módulo.
- No se crean archivos genéricos como `helpers.js` si el nombre del dominio puede ser más preciso.
- `src/constants/` contiene catálogos compartidos por varias piezas, no datos que pertenecen a la base de datos.
- `src/utils/` contiene funciones sin estado y transversales. Una regla exclusiva de órdenes pertenece al módulo de órdenes.
- `src/config/` solo configura infraestructura.
- Un archivo DEBERÍA mantenerse por debajo de unas 300 líneas. Si crece, se separa por responsabilidad, no por cantidad arbitraria de funciones.
- No se mantienen rutas o controladores huérfanos. Si una migración elimina un modelo, la misma entrega elimina o adapta sus usos.

## 6. Diseño de API HTTP

### 6.1 Rutas

- Toda ruta nueva DEBE declarar explícitamente `verifyToken`, salvo que exista una decisión documentada para hacerla pública.
- `authorizeRoles` DEBE ejecutarse después de `verifyToken`.
- Los paths estáticos, por ejemplo `/audit`, `/board` o `/validate-reference`, DEBEN registrarse antes que `/:id`.
- Se usa `GET` para lectura, `POST` para creación, `PUT` solo para reemplazo completo y `PATCH` para cambios parciales o transiciones.
- Se evita incluir verbos en URLs CRUD. Las transiciones de dominio sí pueden usar acciones, por ejemplo `PATCH /orders/:id/finish`.
- No se agrega un prefijo de proxy externo a los routers internos.
- Una ruptura de contrato requiere versión nueva (`/api/v2`) o un periodo de compatibilidad.

### 6.2 Validación de entrada

Cada endpoint DEBE validar por separado:

- `params`: id entero positivo y recurso existente cuando aplique.
- `query`: lista permitida, límites de paginación y coerción segura.
- `body`: presencia, tipo, rango, enum y campos desconocidos.
- Archivos: tamaño, MIME, extensión, nombre y ausencia/presencia según el caso.

Para endpoints nuevos se DEBERÍA adoptar una librería de esquemas, preferentemente Zod, y un middleware común. Hasta incorporarla:

- La normalización se hace una sola vez al inicio.
- No se usa `Boolean(value)` para strings de formulario; `Boolean("false")` es `true`. Se reutiliza `normalizeIsActive` o una función equivalente.
- Todo número debe comprobar `Number.isFinite`, integralidad cuando Prisma espera `Int` y rango permitido.
- Toda fecha debe comprobarse con `Number.isNaN(date.getTime())` antes de persistir.
- Un enum se valida contra una constante compartida, no contra arrays duplicados en varios archivos.
- Los campos desconocidos no se copian con spread directamente hacia Prisma.

Las validaciones del frontend nunca sustituyen estas comprobaciones.

### 6.3 Contrato de respuesta

La API heredada mezcla `data: entity`, `data: { entity }` y respuestas sin `status`. No se cambia de forma global sin coordinar clientes. Para una ruta nueva o una versión nueva se usa:

```json
{
  "status": "success",
  "message": "Recurso creado exitosamente",
  "data": {},
  "meta": {}
}
```

En error:

```json
{
  "status": "error",
  "code": "VALIDATION_ERROR",
  "message": "Los datos enviados no son válidos",
  "details": []
}
```

Reglas:

- `data` contiene directamente el recurso, arreglo o `null`; no se anida otra vez con nombres variables.
- `meta` es hermano de `data` y se usa para paginación o resumen.
- `message` es legible para humanos; `code` es estable para clientes.
- Nunca se devuelve `password`, hash, token de otra cuenta, stacktrace, secreto o archivo pesado en un listado.
- Después de enviar la respuesta se usa `return` o se garantiza que no habrá un segundo envío.

### 6.4 Códigos HTTP

| Código | Uso esperado |
| --- | --- |
| `200` | Lectura, actualización o transición exitosa. |
| `201` | Creación exitosa. |
| `204` | Eliminación sin body, si se adopta de forma consistente. |
| `400` | Entrada inválida o transición de negocio no permitida. |
| `401` | Token ausente, inválido, expirado o usuario inactivo. |
| `403` | Identidad válida sin permisos. |
| `404` | Recurso inexistente o no visible. |
| `409` | Conflicto de unicidad o concurrencia. |
| `413` | Archivo o body demasiado grande. |
| `415` | Tipo de archivo/contenido no admitido. |
| `422` | Validación semántica si el equipo decide diferenciarla de `400`. |
| `500` | Error inesperado; el detalle real se registra solo en servidor. |

### 6.5 Listados

- Los listados potencialmente grandes DEBEN paginar.
- Se reutilizan `parsePagination`, `buildPaginationMeta` y `parseSort` hasta reemplazarlos por una abstracción probada.
- `sortBy` usa una lista blanca; nunca se inyecta directamente en Prisma.
- `pageSize` siempre tiene máximo explícito.
- La búsqueda no debe hacer consultas N+1.
- La respuesta paginada incluye `page`, `pageSize`, `total`, `totalPages`, `hasPreviousPage` y `hasNextPage`.
- El filtro de activos debe ser coherente. Si el caso normal es operar solo con activos, el servicio aplica `is_active: true` sin depender del cliente.

## 7. Autenticación y autorización

### 7.1 JWT y cookies

- `JWT_SECRET` DEBE existir al iniciar y tener entropía suficiente. La aplicación debería fallar rápido si falta.
- El token puede llegar por cookie o `Authorization: Bearer`, pero se debe documentar cuál usa cada cliente.
- La vigencia real del JWT y `maxAge` de la cookie DEBEN mantenerse sincronizados.
- Cookies productivas: `httpOnly`, `secure` y `sameSite` acorde con el despliegue.
- CORS con credenciales exige una lista exacta de orígenes; nunca se usa `*`.
- No se registran tokens, cookies, hashes ni bodies con credenciales.

### 7.2 Roles

- Los permisos viven en rutas o políticas reutilizables, no únicamente dentro de botones del frontend.
- Un endpoint con efectos productivos DEBE tener una decisión explícita de roles.
- Los cambios de rol deben impedir escalamiento de privilegios.
- Un usuario inactivo no puede autenticarse ni conservar acceso mediante un token previo.
- Las acciones críticas deberían registrar actor, fecha y recurso afectado.

### 7.3 Registro público actual

`POST /auth/register` es público y crea usuarios `USER`. Ese rol puede iniciar y terminar procesos de órdenes. Antes de exposición abierta se DEBE tomar una decisión de producto y seguridad:

- deshabilitar auto-registro en producción;
- exigir invitación/aprobación; o
- reducir los permisos del rol auto-registrado.

No se debe asumir que el rol por defecto elimina el riesgo.

## 8. Configuración y secretos

- `.env` nunca se versiona.
- `.env.example` DEBE versionarse, contener todas las claves soportadas y valores ficticios seguros.
- Cada variable nueva actualiza `.env.example`, README y configuración de despliegue en el mismo cambio.
- La configuración requerida se valida una sola vez al arranque.
- `CORS_ALLOWED_ORIGINS` contiene orígenes separados por coma y sin paths.
- `SOCKET_IO_PATH` es un path, no una URL completa.
- No se codifican dominios, secretos, usuarios o passwords productivos en código/seed.
- Los valores `SEED_BULK_ORDERS` y datos demo no se habilitan en producción.

Deuda actual: `.gitignore` ignora `.env.example`; se debe reemplazar esa regla por una excepción que permita versionar la plantilla.

## 9. Prisma y PostgreSQL

### 9.1 Esquema y migraciones

- Todo cambio persistente empieza en `prisma/schema.prisma` y genera una migración revisable.
- Comando de desarrollo, desde la raíz:

```powershell
npx prisma migrate dev --name descripcion_en_snake_case
```

- Producción aplica migraciones con:

```powershell
npx prisma migrate deploy
```

- Nunca se edita una migración ya aplicada en un entorno compartido.
- Nunca se usa `prisma db push` como sustituto de migraciones productivas.
- Una migración destructiva incluye respaldo, estrategia de datos y rollback operativo.
- Las claves foráneas, `onDelete`, índices y restricciones únicas se revisan conscientemente.
- Un cambio de enum considera datos existentes y clientes desplegados.
- Después de modificar el esquema se ejecutan `npx prisma format`, `npx prisma validate` y `npx prisma generate`.

### 9.2 Consultas

- Usar `select` cuando el cliente no necesita el modelo completo.
- Evitar devolver el campo `Troqueles.file` en listados.
- Evitar `findMany` sin paginación sobre tablas de crecimiento operativo.
- Usar `Promise.all` solo para consultas independientes.
- Usar transacción interactiva cuando una lectura condiciona varias escrituras.
- Mapear errores Prisma conocidos (`P2002`, `P2025`, etc.) a códigos HTTP consistentes.
- Una consulta nueva con búsqueda/ordenamiento frecuente debe evaluar índice.
- No construir SQL crudo con interpolación de entrada. Si fuera necesario, usar APIs parametrizadas de Prisma.

### 9.3 Borrado lógico

- `DELETE` de catálogos actuales significa `is_active = false` salvo especificación contraria.
- Los listados operativos deben excluir inactivos por defecto; una vista administrativa puede pedirlos explícitamente.
- Las relaciones nuevas validan que los registros referenciados estén activos.
- Reactivar un registro es una operación explícita y auditada.
- Antes de crear, se revisa si existe un registro inactivo bloqueado por una restricción única.
- La historia productiva nunca debe perder sus relaciones por un borrado de catálogo.

## 10. Reglas invariantes del dominio

### 10.1 Terceros, productos y troqueles

- Un tercero tiene tipo `CLIENTE`, `PROVEEDOR` u `OTROS`, además de tipo de persona y documento válidos.
- Email y combinación tipo/número de documento no pueden duplicarse.
- Un `Product` relaciona directamente un `Thirds` con un `Troqueles`.
- Al crear/editar producto, tercero y troquel deben existir y estar activos.
- El módulo antiguo `Product_Customer` ya no forma parte del dominio actual.
- El código de troquel es único por combinación `(size, code)`, sin distinguir mayúsculas en validación de aplicación.
- El archivo del troquel es opcional; si se envía debe pasar validación de upload.

### 10.2 Papel y proveedores

- Un tipo de papel requiere nombre, descripción, gramaje positivo y al menos un proveedor.
- Cada proveedor asociado debe ser un tercero activo de tipo `PROVEEDOR`.
- No se repite `third_id` dentro de la misma petición.
- El precio de compra es positivo y se guarda como `Decimal(12,2)`.
- La actualización de papel y sus proveedores es atómica.

### 10.3 Cálculo de órdenes

La fórmula vigente es:

```text
unitsPerSheet = format.sheet_divisions × cavities

TOTAL_REQUIRED:
  amountSheets = ceil(totalEstimated / unitsPerSheet)

SHEETS_REQUIRED:
  totalEstimated = amountSheets × unitsPerSheet
```

Directivas:

- `sheet_divisions`, `cavities`, `amount_sheets` y `total_estimated` son enteros positivos.
- El fallback que infiere divisiones desde nombres como `1/4 Pliego` se conserva solo por compatibilidad; los formatos nuevos deben almacenar `sheet_divisions` correctamente.
- Medida, papel, troquel, producto y procesos deben existir y estar activos.
- `product.troquel_id` debe coincidir con `troquel_id` de la orden.
- Los procesos se normalizan a ids únicos.
- La creación de cabecera y detalles debe ser atómica. El flujo actual hace una escritura anidada; un refactor debe preservar esa atomicidad.
- Una orden con cualquier detalle iniciado o terminado no se edita.
- El endpoint manual de finalización no debería permitir inconsistencias con detalles pendientes; cualquier ajuste debe definir la regla y probarla.

### 10.4 Flujo de procesos

Transición permitida:

```text
PENDIENTE ──start──► EN_PROCESO ──finish──► TERMINADO
```

- No se salta un proceso anterior no terminado.
- Los detalles se ordenan por `Process.order` y luego por id como desempate.
- Al iniciar se registra actor y timestamps; maquinaria es opcional y debe estar activa si se envía.
- `measure_cutting_id` se deriva de la medida de la orden y no se acepta desde el cliente.
- Después de iniciar, los datos de entrada quedan bloqueados.
- Al finalizar solo se reciben `quantity_delivered` y `quantity_damaged`.
- Las cantidades son enteros no negativos y deben ser finitas.
- El estado y los totales de la cabecera se recalculan dentro de la misma transacción.
- El último detalle terminado define el total entregado actual; los daños se acumulan.

### 10.5 Campos dinámicos

- La clave se guarda en `snake_case` minúsculo y es única dentro del proceso.
- Una definición referenciada por valores históricos no se elimina.
- El backend DEBE validar `is_required`, `field_type` y `options` antes de iniciar un proceso.
- Un valor solo puede pertenecer a una definición del mismo proceso.
- No se aceptan ids de campos desconocidos silenciosamente.
- Cambiar el tipo de un campo con datos históricos requiere una migración/compatibilidad explícita.

La implementación actual almacena valores como `String` y no aplica todas estas validaciones; es una brecha prioritaria, no una razón para repetir el patrón.

## 11. Archivos de troquel

La implementación actual usa `multer.memoryStorage()` con límite de 20 MB y persiste base64 en la tabla.

Reglas:

- El middleware de upload se declara una sola vez por módulo; actualmente existe una configuración duplicada y una de ellas no se usa.
- Se valida MIME y extensión mediante lista blanca acorde con el negocio.
- Un error de tamaño responde `413`; un tipo no permitido responde `415`.
- Se sanea el nombre original y nunca se usa como ruta de filesystem.
- Los listados no seleccionan `file`.
- El detalle solo devuelve el contenido cuando el contrato lo necesita; idealmente se expone un endpoint de descarga separado.
- Para crecimiento productivo se recomienda almacenamiento de objetos y guardar en PostgreSQL solo metadatos/URL segura.

## 12. Socket.IO y eventos

- El servidor HTTP y Socket.IO comparten CORS y `SOCKET_IO_PATH`.
- Toda mutación relevante emite evento solo después de que la transacción haya confirmado.
- El nombre sigue `<recurso>:<acción>`; `production:changed` permanece como evento agregador.
- El payload incluye ids, estado y timestamp, no modelos completos ni datos sensibles.
- La emisión no sustituye la respuesta HTTP ni la persistencia.
- Si el cliente puede perder eventos, debe reconsultar el estado por HTTP al reconectar.
- Antes de exponer el socket en Internet se DEBE autenticar el handshake y autorizar salas/canales. La emisión global actual no ofrece aislamiento.
- Cualquier evento nuevo se documenta con nombre, disparador y payload.

## 13. Manejo de errores y observabilidad

Dirección esperada:

- Introducir clases/objetos de error de dominio con `status`, `code` y mensaje seguro.
- Centralizar el manejo en un middleware Express al final de la cadena.
- En Express 4, envolver handlers async o asegurar `try/catch`; una promesa rechazada no debe quedar fuera del pipeline.
- Agregar handler 404 JSON.
- Incluir un identificador de petición en logs y respuestas de error.
- Usar logger estructurado por nivel en producción; evitar `console.log` disperso.
- No registrar secretos, archivos base64 ni datos personales completos.
- Agregar `/health` para vida del proceso y `/ready` para dependencia de base de datos, según la plataforma.
- Cerrar HTTP, Socket.IO y Prisma ante `SIGTERM` y `SIGINT`.

La respuesta 500 debe ser genérica; el error técnico se conserva en logs con contexto suficiente para diagnosticar.

## 14. Seed y datos de demostración

- El seed DEBE ser idempotente cuando se ejecuta sin `--bulk-orders`.
- Datos obligatorios de plataforma y datos demo deberían separarse en scripts distintos.
- No se almacenan credenciales demo conocidas en un seed que corra automáticamente en producción.
- El seed no debe reactivar ni sobrescribir datos administrados por usuarios en producción.
- `--bulk-orders`/`SEED_BULK_ORDERS` es solo para pruebas de carga; cada ejecución agrega nuevas órdenes.
- `npm run start:prod` no debería ejecutar el seed general. Flujo recomendado:

```text
release: prisma migrate deploy
bootstrap controlado: seed de catálogos mínimos, una sola vez
start: node src/server.js
```

## 15. Pruebas y controles de calidad

### 15.1 Estado actual

No existe framework de pruebas ni scripts `test`, `lint` o `format`. Hasta instalarlos, el mínimo antes de entregar es:

```powershell
Set-Location -LiteralPath 'C:\Users\juanp\Desktop\PROGRAFICOS\backend-prograficos'

Get-ChildItem -Recurse -File -Include '*.js' -Path 'src','prisma' |
  ForEach-Object { node --check $_.FullName }

npx prisma format
npx prisma validate
git diff --check
```

`prisma format` modifica el esquema; se revisa su diff. `prisma validate` puede requerir descargar el binario oficial la primera vez.

### 15.2 Suite recomendada

Se recomienda incorporar:

- Vitest o el runner nativo de Node para unitarias.
- Supertest para integración HTTP.
- Una base PostgreSQL aislada para integración de Prisma.
- Factories pequeñas en vez de depender del seed completo.
- ESLint y Prettier con scripts reproducibles.
- CI que ejecute instalación limpia, generación Prisma, lint y tests.

### 15.3 Cobertura mínima por tipo de cambio

| Cambio | Verificación mínima esperada |
| --- | --- |
| Utilidad pura | Casos normales, límites y entradas inválidas. |
| Endpoint | éxito, 400, 401, 403, 404 y conflicto relevante. |
| Rol/permisos | matriz de roles permitidos y denegados. |
| Migración | aplicar desde base previa y desde base vacía. |
| Transición de proceso | estado previo inválido, secuencia, concurrencia y totales. |
| Borrado lógico | ocultamiento por defecto, historia preservada y reactivación. |
| Upload | archivo válido, ausente, tamaño excesivo y MIME inválido. |
| Socket | evento emitido una sola vez después del commit. |

Los controladores de órdenes y procesos son los primeros candidatos para pruebas de integración.

## 16. Documentación obligatoria

| Si cambia... | También se actualiza... |
| --- | --- |
| Ruta, método, rol, query o body | `API_ENDPOINTS.md` y pruebas del contrato. |
| Variable de entorno | `.env.example`, README y configuración del despliegue. |
| Modelo/enum/relación | `schema.prisma`, migración, seed y documentación de dominio. |
| Evento Socket.IO | README/guía y consumidor frontend. |
| Script npm | `package.json` y README. |
| Flujo de negocio | Esta guía y pruebas de transición. |
| Cambio incompatible | Plan de versión/migración y comunicación al cliente. |

No se documenta una ruta no montada como si estuviera disponible. `product_customer` debe retirarse de la documentación histórica o marcarse como eliminado.

## 17. Git, commits y revisión

- Cada rama resuelve un objetivo acotado.
- Se recomienda `feature/<descripcion>`, `fix/<descripcion>`, `refactor/<descripcion>` o el prefijo exigido por la plataforma.
- Los commits siguen Conventional Commits, coherente con el historial: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.
- No se mezclan cambios de formato masivo con lógica funcional.
- No se versionan `.env`, dumps, archivos generados de Prisma ni credenciales.
- `package-lock.json` cambia junto con `package.json` cuando se alteran dependencias.
- Una migración se revisa como código; no se acepta solo porque Prisma la generó.
- El pull request explica impacto de API, datos, seguridad, despliegue y verificación.

## 18. Directivas para revisión de código

El revisor debe comprobar:

- ¿La ruta está realmente montada y en el orden correcto?
- ¿Autenticación y roles coinciden con el riesgo de la operación?
- ¿Params, query, body y archivo se validan en backend?
- ¿Se preservan invariantes de órdenes y procesos?
- ¿La operación compuesta es atómica?
- ¿Se evita devolver información sensible o cargas pesadas?
- ¿El borrado lógico y registros inactivos se manejan explícitamente?
- ¿Los errores Prisma conocidos se traducen correctamente?
- ¿La lista está paginada y el sort usa lista blanca?
- ¿El evento se emite después del commit y sin datos sensibles?
- ¿Hay pruebas o evidencia proporcional al cambio?
- ¿Documentación, env, migraciones y seed están sincronizados?
- ¿El cambio evita ampliar deuda técnica fuera de su alcance?

## 19. Deuda técnica priorizada

### Prioridad 0: seguridad y coherencia productiva

1. Separar el seed de desarrollo de `start:prod`; impedir credenciales demo y reactivaciones automáticas en producción.
2. Revisar el registro público, porque un `USER` auto-registrado puede iniciar y finalizar procesos.
3. Eliminar `product_customer.controller.js` y `product_customer.routes.js` o conservarlos únicamente como historia fuera de `src`; actualizar `API_ENDPOINTS.md`.
4. Versionar una `.env.example` completa y dejar de ignorarla.
5. Validar variables requeridas al arranque.

### Prioridad 1: confiabilidad

1. Agregar validación por esquemas y middleware global de errores/404.
2. Crear pruebas de integración para auth, roles, órdenes y procesos.
3. Corregir el doble `express.json()`: el parser sin límite explícito se ejecuta antes del configurado a 50 MB.
4. Reducir límites de body según endpoint y manejar errores de Multer.
5. Autenticar Socket.IO y definir canales autorizados.
6. Impedir que `PATCH /order/:id/finish` cierre una orden con detalles incompatibles.
7. Validar obligatoriedad/tipo/opciones de campos dinámicos.

### Prioridad 2: mantenibilidad y operación

1. Extraer servicios de órdenes y procesos.
2. Uniformar respuestas en una API versionada.
3. Adoptar rutas plurales en `kebab-case` para la siguiente versión.
4. Agregar lint, format, CI, health/readiness y logs estructurados.
5. Generar OpenAPI desde contratos verificados.
6. Migrar archivos de troquel a almacenamiento de objetos.
7. Revisar índices para búsquedas y auditoría conforme crezcan los datos.

## 20. Definición de terminado

Un cambio está terminado cuando:

- [ ] Cumple la necesidad sin romper una regla de dominio.
- [ ] Mantiene o migra explícitamente el contrato público.
- [ ] Valida params, query, body y archivos aplicables.
- [ ] Aplica autenticación y roles correctos.
- [ ] Usa transacción cuando existe más de una escritura dependiente.
- [ ] Preserva borrado lógico e historia.
- [ ] No expone secretos, hashes, base64 innecesario ni stacktraces.
- [ ] Incluye pruebas automatizadas; si aún no es posible, deja validación manual reproducible y declara la limitación.
- [ ] Pasa comprobación de sintaxis, Prisma y `git diff --check`.
- [ ] Actualiza documentación, env, migración, seed y eventos que correspondan.
- [ ] No deja archivos, rutas, imports ni código muerto.
- [ ] El pull request explica despliegue y rollback cuando hay impacto operativo.

## 21. Hallazgos verificados durante este análisis

- El esquema Prisma actual es válido y contiene 14 modelos y 10 enums.
- La sintaxis de los archivos JavaScript bajo `src/` y `prisma/` es válida.
- Hay 64 endpoints Express efectivamente montados.
- `product_customer` no está montado y su modelo fue eliminado por migración.
- La documentación histórica usa todavía `product_customer_id` en órdenes, mientras el código actual usa `product_id` y valida `troquel_id`.
- El archivo de troquel es opcional en el esquema/controlador, aunque la referencia histórica lo presenta como obligatorio.
- Existen rutas actuales no reflejadas completamente en la referencia histórica: monitor de órdenes, validación de maquinaria, validación/reordenamiento de procesos y filtros paginados.
- El esquema pasó `prisma validate`; no se ejecutaron pruebas funcionales porque el proyecto no incluye una suite.

Estos hallazgos describen el estado observado, no sustituyen una auditoría de seguridad ni pruebas end-to-end con una base aislada.
