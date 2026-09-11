# API Endpoints

Documento de referencia rápida para los endpoints actuales del backend de `backend-prograficos`.

## Base URL

- Local: `http://localhost:5001`
- Producción detrás de proxy: normalmente la misma API se publica con un prefijo como `/prograficos`
- Las rutas listadas en este documento corresponden a las rutas internas del backend. Si en producción tu proxy publica la API en `https://api.opita.dev/prograficos`, entonces debes anteponer `/prograficos` a cada endpoint.

## Autenticación

- La mayoría de endpoints requieren token.
- El backend acepta el token en:
  - cookie `token`
  - header `Authorization: Bearer <token>`

## Query Params comunes

- En varios catálogos puedes usar `?onlyActive=true` para traer solo registros activos.

## Auth

### `POST /auth/register`

Body:

```json
{
  "name": "Juan",
  "surename": "Pérez",
  "email": "juan@example.com",
  "password": "123456"
}
```

### `POST /auth/login`

Body:

```json
{
  "email": "juan@example.com",
  "password": "123456"
}
```

### `POST /auth/logout`

Sin body.

### `GET /auth/profile`

Requiere token.

## Users

### `GET /users/`

Requiere rol: `ADMIN`, `SUPERVISOR`

### `GET /users/:id`

Requiere rol: `ADMIN`, `SUPERVISOR`

### `POST /users/create`

Requiere rol: `ADMIN`, `SUPERVISOR`

Body:

```json
{
  "name": "Juan",
  "surename": "Pérez",
  "email": "juan@example.com",
  "password": "123456",
  "role": "USER",
  "avatar": "https://...",
  "is_active": true
}
```

### `PUT /users/update/:id`

Requiere rol: `ADMIN`, `SUPERVISOR`

Body:

```json
{
  "name": "Juan",
  "surename": "Pérez",
  "email": "juan@example.com",
  "password": "123456",
  "role": "USER",
  "avatar": "https://...",
  "is_active": true
}
```

Todos los campos son opcionales; solo se actualizan los enviados.

### `DELETE /users/delete/:id`

Requiere rol: `ADMIN`, `SUPERVISOR`

Sin body. Hace borrado lógico (`is_active = false`).

## Formats

### `GET /formats/`

Requiere rol: `ADMIN`, `SUPERVISOR`

Query opcional:

```txt
?onlyActive=true
```

### `GET /formats/:id`

Requiere rol: `ADMIN`, `SUPERVISOR`

### `POST /formats/`

Requiere rol: `ADMIN`, `SUPERVISOR`

Body:

```json
{
  "name": "Pliego",
  "is_active": true
}
```

### `PUT /formats/:id`

Requiere rol: `ADMIN`, `SUPERVISOR`

Body:

```json
{
  "name": "Pliego",
  "is_active": true
}
```

### `DELETE /formats/:id`

Requiere rol: `ADMIN`, `SUPERVISOR`

Sin body. Hace borrado lógico.

## Measures

### `GET /measures/`

Requiere rol: `ADMIN`, `SUPERVISOR`, `EMPLOYEE`, `USER`

Query opcional:

```txt
?onlyActive=true
```

### `GET /measures/:id`

Requiere rol: `ADMIN`, `SUPERVISOR`, `EMPLOYEE`, `USER`

### `POST /measures/`

Requiere rol: `ADMIN`, `SUPERVISOR`

Body:

```json
{
  "width": 70,
  "height": 100,
  "format_id": 1,
  "is_active": true
}
```

### `PUT /measures/:id`

Requiere rol: `ADMIN`, `SUPERVISOR`

Body:

```json
{
  "width": 70,
  "height": 100,
  "format_id": 1,
  "is_active": true
}
```

### `DELETE /measures/:id`

Requiere rol: `ADMIN`, `SUPERVISOR`

Sin body. Hace borrado lógico.

## Paper Types

### `GET /paper_types/`

Requiere rol: `ADMIN`, `SUPERVISOR`

Query opcional:

```txt
?onlyActive=true
```

### `GET /paper_types/:id`

Requiere rol: `ADMIN`, `SUPERVISOR`

### `POST /paper_types/`

Requiere rol: `ADMIN`, `SUPERVISOR`

Body:

```json
{
  "name": "Propalcote",
  "description": "Couché",
  "grammage": 300,
  "is_active": true,
  "suppliers": [
    {
      "third_id": 2,
      "purchase_price": 1450.5
    }
  ]
}
```

### `PUT /paper_types/:id`

Requiere rol: `ADMIN`, `SUPERVISOR`

Body:

```json
{
  "name": "Propalcote",
  "description": "Couché",
  "grammage": 300,
  "is_active": true,
  "suppliers": [
    {
      "third_id": 2,
      "purchase_price": 1450.5
    }
  ]
}
```

Notas:

- `grammage` es obligatorio.
- `suppliers` es obligatorio y debe traer al menos un proveedor.
- Cada proveedor debe ser un tercero activo de tipo `PROVEEDOR`.
- No se puede repetir el mismo `third_id` dentro del arreglo.

### `DELETE /paper_types/:id`

Requiere rol: `ADMIN`, `SUPERVISOR`

Sin body. Hace borrado lógico.

## Machinery

### `GET /machinery/`

Requiere rol: `ADMIN`, `SUPERVISOR`, `EMPLOYEE`, `USER`

Query opcional:

```txt
?onlyActive=true
```

### `GET /machinery/validate-reference`

Requiere rol: `ADMIN`, `SUPERVISOR`

Valida disponibilidad/unicidad de una referencia de maquinaria antes de guardar.

### `GET /machinery/:id`

Requiere rol: `ADMIN`, `SUPERVISOR`, `EMPLOYEE`, `USER`

### `POST /machinery/`

Requiere rol: `ADMIN`, `SUPERVISOR`

Body:

```json
{
  "name": "Heidelberg",
  "reference": "HD-01",
  "type": "IMPRESORA_OFFSET",
  "is_active": true
}
```

### `PUT /machinery/:id`

Requiere rol: `ADMIN`, `SUPERVISOR`

Body:

```json
{
  "name": "Heidelberg",
  "reference": "HD-01",
  "type": "IMPRESORA_OFFSET",
  "is_active": true
}
```

Tipos permitidos:

```txt
PREPRENSA
GUILLOTINA
IMPRESORA_OFFSET
IMPRESORA_DIGITAL
PLASTIFICADORA
LAMINADORA
BARNIZADORA
ESTAMPADORA
TROQUELADORA
PEGADORA
DOBLADORA
EMPAQUE
OTRA
```

### `DELETE /machinery/:id`

Requiere rol: `ADMIN`, `SUPERVISOR`

Sin body. Hace borrado lógico.

## Thirds

### `GET /thirds/`

Requiere rol: `ADMIN`, `SUPERVISOR`

Query opcional:

```txt
?onlyActive=true
```

### `GET /thirds/:id`

Requiere rol: `ADMIN`, `SUPERVISOR`

### `POST /thirds/`

Requiere rol: `ADMIN`, `SUPERVISOR`

Body:

```json
{
  "name": "Cliente Demo",
  "email": "cliente@example.com",
  "address": "Calle 123",
  "type_person": "CLIENTE",
  "company_name": "Empresa SAS",
  "is_active": true
}
```

### `PUT /thirds/:id`

Requiere rol: `ADMIN`, `SUPERVISOR`

Body:

```json
{
  "name": "Cliente Demo",
  "email": "cliente@example.com",
  "address": "Calle 123",
  "type_person": "CLIENTE",
  "company_name": "Empresa SAS",
  "is_active": true
}
```

### `DELETE /thirds/:id`

Requiere rol: `ADMIN`, `SUPERVISOR`

Sin body. Hace borrado lógico.

## Products

### `GET /products/`

Requiere rol: `ADMIN`, `SUPERVISOR`

Query opcional:

```txt
?onlyActive=true
```

### `GET /products/:id`

Requiere rol: `ADMIN`, `SUPERVISOR`

### `POST /products/`

Requiere rol: `ADMIN`, `SUPERVISOR`

Body:

```json
{
  "name": "Caja Cliente X",
  "troquel_id": 3,
  "third_id": 2,
  "is_active": true
}
```

Notas:

- Un `Product` es el puente entre un `Thirds` (cliente) y un `Troqueles`.
- `troquel_id` y `third_id` son obligatorios y deben referenciar registros activos.
- `name` es opcional.

### `PUT /products/:id`

Requiere rol: `ADMIN`, `SUPERVISOR`

Body:

```json
{
  "name": "Caja Cliente X",
  "troquel_id": 3,
  "third_id": 2,
  "is_active": true
}
```

### `DELETE /products/:id`

Requiere rol: `ADMIN`, `SUPERVISOR`

Sin body. Hace borrado lógico.

> Nota: El módulo `Product_Customer` (`/product_customers/*`) fue eliminado del
> dominio. `Product` ahora relaciona directamente `Thirds` con `Troqueles`, por
> lo que ya no existe una entidad intermedia ni sus endpoints.

## Troqueles

### `GET /troqueles/`

Requiere token.

Query opcional:

```txt
?onlyActive=true
```

### `GET /troqueles/:id`

Requiere token.

### `POST /troqueles/`

Requiere rol: `ADMIN`, `SUPERVISOR`

Tipo de request: `multipart/form-data`

Campos:

```txt
code               string (requerido)
elaboration_date   string (opcional, fecha)
size               string (requerido)
is_active          boolean|string|number (opcional)
file               archivo requerido
```

### `PUT /troqueles/:id`

Requiere rol: `ADMIN`, `SUPERVISOR`

Tipo de request: `multipart/form-data`

Campos:

```txt
code               string (requerido)
elaboration_date   string (opcional, fecha)
size               string (opcional)
is_active          boolean|string|number (opcional)
file               archivo opcional
```

### `DELETE /troqueles/:id`

Requiere rol: `ADMIN`, `SUPERVISOR`

Sin body. Hace borrado lógico.

## Processes

### `GET /processes/`

Requiere rol: `ADMIN`, `SUPERVISOR`

Query opcional:

```txt
?onlyActive=true
```

### `GET /processes/validate-field-key`

Requiere rol: `ADMIN`, `SUPERVISOR`

Valida que la `key` de un campo dinámico sea única dentro del proceso.

### `PATCH /processes/reorder`

Requiere rol: `ADMIN`, `SUPERVISOR`

Reordena los procesos (actualiza el campo `order`).

### `GET /processes/:id`

Requiere rol: `ADMIN`, `SUPERVISOR`

### `POST /processes/`

Requiere rol: `ADMIN`, `SUPERVISOR`

Body:

```json
{
  "name": "Impresión",
  "order": 2,
  "category": "IMPRESION",
  "is_active": true,
  "field_definitions": [
    {
      "key": "color",
      "label": "Color",
      "field_type": "TEXT",
      "is_required": false,
      "sort_order": 1,
      "options": null
    }
  ]
}
```

`field_definitions` puede ir vacío.

### `PUT /processes/:id`

Requiere rol: `ADMIN`, `SUPERVISOR`

Body:

```json
{
  "name": "Impresión",
  "order": 2,
  "category": "IMPRESION",
  "is_active": true,
  "field_definitions": [
    {
      "id": 5,
      "key": "color",
      "label": "Color",
      "field_type": "TEXT",
      "is_required": false,
      "sort_order": 1,
      "options": null
    }
  ]
}
```

Notas:

- Si el campo ya existe, conviene enviar `id`.
- Si un campo ya tiene registros históricos, no se puede eliminar.

### `DELETE /processes/:id`

Requiere rol: `ADMIN`, `SUPERVISOR`

Sin body. Hace borrado lógico.

## Orders

### `GET /order/`

Requiere token.

### `GET /order/:id`

Requiere token.

### `GET /order/board`

Requiere token.

Devuelve las órdenes activas para el monitor/tablero de producción.

### `GET /order/audit`

Requiere token.

Devuelve órdenes cerradas con trazabilidad completa.

### `POST /order/`

Requiere rol: `ADMIN`, `SUPERVISOR`

Body:

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

- `date_delivery_estimated` en creación puede ir `null` o vacío.
- `calculation_mode` acepta `TOTAL_REQUIRED` o `SHEETS_REQUIRED`; determina si se calcula `amount_sheets` a partir de `total_estimated` o al revés.
- `product_id` reemplaza al antiguo `product_customer_id`. El `product.troquel_id` debe coincidir con el `troquel_id` de la orden.
- `processes` debe llevar al menos un proceso.

### `PUT /order/:id`

Requiere rol: `ADMIN`, `SUPERVISOR`, `EMPLOYEE`

Body:

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
  "field_values": [],
  "order_status": "PENDIENTE"
}
```

Nota:

- Solo se puede editar si ningún proceso ha sido iniciado.
- En la implementación actual conviene enviar siempre `date_delivery_estimated` con una fecha válida al actualizar.

### `DELETE /order/:id`

Requiere rol: `ADMIN`, `SUPERVISOR`

Sin body. Hace borrado lógico.

### `PATCH /order/:id/finish`

Requiere rol: `ADMIN`, `SUPERVISOR`

Sin body.

Marca la orden como `TERMINADO`.

## Order Processes

### `GET /order-processes/order/:orderId`

Requiere token.

Lista los procesos de una orden.

### `GET /order-processes/:id`

Requiere token.

Detalle de un proceso específico de una orden.

### `PATCH /order-processes/:id/start`

Requiere rol: `ADMIN`, `SUPERVISOR`, `EMPLOYEE`, `USER`

Body:

```json
{
  "machinery_id": 1,
  "observations": "Arranque correcto",
  "field_values": [
    {
      "field_definition_id": 10,
      "value": "Azul"
    }
  ]
}
```

Notas:

- `measure_cutting_id` no debe enviarse; se toma automáticamente de la orden.
- Solo se puede iniciar si el proceso anterior ya terminó.
- Los datos de entrada quedan bloqueados después del inicio.

### `PATCH /order-processes/:id/finish`

Requiere rol: `ADMIN`, `SUPERVISOR`, `EMPLOYEE`, `USER`

Body:

```json
{
  "quantity_delivered": 1490,
  "quantity_damaged": 10
}
```

Notas:

- Solo se puede finalizar si ya está `EN_PROCESO`.
- Al finalizar no se aceptan cambios de maquinaria, medida, observaciones ni campos dinámicos.

## Roles usados en el proyecto

- `ADMIN`
- `SUPERVISOR`
- `EMPLOYEE`
- `USER`

## Estados comunes

### Orden

- `PENDIENTE`
- `EN_PROCESO`
- `TERMINADO`
- `ENTREGADO`

### Proceso de orden

- `PENDIENTE`
- `EN_PROCESO`
- `TERMINADO`
