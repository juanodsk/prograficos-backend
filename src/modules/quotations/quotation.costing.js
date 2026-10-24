// Motor de costeo de cotizaciones — LÍNEA OFFSET.
// Función PURA: no depende de Mongo, HTTP ni Prisma. Recibe las entradas ya
// resueltas (cantidades, divisiones del formato, precio del papel del proveedor,
// etc.) y devuelve el desglose de costos. Replica la hoja de Excel usada hoy.
//
// Cartón Microcorrugado costea distinto (por centenas, no por millar): tendrá
// su propio motor; este archivo es exclusivo de Offset.

export const PRECIO_PLANCHA = 25000; // COP por plancha (una por tinta).
const IMPRESION_BASE_FORMATO_GRANDE = 40000; // 1 pliego y 1/2 pliego.
const IMPRESION_BASE_FORMATO_PEQUENO = 30000; // 1/4 de pliego y menores.
const MAX_TINTAS = 4; // 4 = policromía (CMYK).

// Dinero en COP: sin decimales.
const roundCOP = (value) => Math.round(value);

// Millares (OFFSET): las pasadas por la máquina = cantidad / cavidad (porque
// cada golpe imprime "cavidad" piezas). Esas pasadas se cobran por millar,
// redondeando al millar MÁS CERCANO (la mitad sube: 2.5 → 3). Mínimo 1.
//   cav 1: 1000→1 · 1500→2 · 2300→2 · 2500→3
//   cav 2: 5000/2=2500 → 3
export const resolveMillaresOffset = (cantidad, cavidad = 1) =>
  Math.max(
    1,
    Math.round(Number(cantidad) / (Number(cavidad) || 1) / 1000),
  );

// Base de impresión por tamaño del formato (según divisiones del pliego):
// 1 pliego (1) y 1/2 pliego (2) valen más; de 1/4 (4) para abajo, menos.
export const resolveImpresionBase = (divisiones) =>
  Number(divisiones) <= 2
    ? IMPRESION_BASE_FORMATO_GRANDE
    : IMPRESION_BASE_FORMATO_PEQUENO;

// Suma de los costos FIJOS (se cobran una sola vez): diseño, troquel, acabados,
// corte y pegado. Troquelado y plastificado NO van aquí: se cobran por millar.
const sumCostosFijos = (costos = {}) =>
  [
    costos.diseno,
    costos.troquel,
    costos.acabados,
    costos.corte,
    costos.pegado,
  ].reduce((acc, value) => acc + (Number(value) || 0), 0);

/**
 * Calcula el costeo de una cotización Offset.
 *
 * @param {object} input
 * @param {number} input.cantidad        Cantidad requerida (ya con reserva si aplica).
 * @param {number} input.divisiones      Divisiones del pliego (formato). Ej: 2 = 1/2 pliego.
 * @param {number} input.cavidad         Cavidades del troquel.
 * @param {number} input.precioPapel     Precio del papel por pliego (del proveedor).
 * @param {number} input.tintas          Número de tintas 1..4.
 * @param {number} input.porcentajeGanancia  % de ganancia sobre el subtotal (interno).
 * @param {object} [input.costos]        Costos manuales. Fijos (una vez): diseno,
 *                                       troquel, acabados, corte, pegado. Por millar
 *                                       (tarifa × millares): troqueladoMillar,
 *                                       plastificadoMillar.
 * @returns {object} Desglose completo del costeo.
 */
export const calculateOffsetQuotation = (input = {}) => {
  const cantidad = Number(input.cantidad);
  const divisiones = Number(input.divisiones);
  const cavidad = Number(input.cavidad);
  const precioPapel = Number(input.precioPapel);
  const tintas = Number(input.tintas);
  const porcentajeGanancia = Number(input.porcentajeGanancia);

  // Guardas mínimas: el detalle de validación/mensajes vive en la capa de
  // validación del módulo; aquí protegemos la matemática.
  if (!Number.isFinite(cantidad) || cantidad <= 0) {
    throw new Error("La cantidad requerida debe ser mayor a 0");
  }
  if (!Number.isInteger(divisiones) || divisiones <= 0) {
    throw new Error("Las divisiones del formato deben ser un entero mayor a 0");
  }
  if (!Number.isInteger(cavidad) || cavidad <= 0) {
    throw new Error("Las cavidades deben ser un entero mayor a 0");
  }
  if (!Number.isFinite(precioPapel) || precioPapel < 0) {
    throw new Error("El precio del papel no es válido");
  }
  if (!Number.isInteger(tintas) || tintas < 0 || tintas > MAX_TINTAS) {
    throw new Error("Las tintas deben estar entre 0 y 4 (0 = sin impresión)");
  }
  if (!Number.isFinite(porcentajeGanancia) || porcentajeGanancia < 0) {
    throw new Error("El porcentaje de ganancia no es válido");
  }

  // Unidades por pliego (lo que el Excel llama "Formato Sobre Pliego") =
  // divisiones del formato × cavidad. Pliegos A COMPRAR = se redondea hacia
  // arriba (no puedes comprar medio pliego).
  const unidadesPorPliego = divisiones * cavidad;
  const pliegosExactos = cantidad / unidadesPorPliego;
  const pliegos = Math.ceil(pliegosExactos);

  // El PAPEL se cuesta sobre la necesidad exacta (fracción), no sobre el entero
  // de compra: p. ej. 5000/16 = 312.5 pliegos (el medio sobrante va aparte).
  const precioPliegosRaw = pliegosExactos * precioPapel;
  const precioPliegos = roundCOP(precioPliegosRaw);

  // Millares = pasadas por la máquina (cantidad/cavidad) al millar más cercano.
  const millares = resolveMillaresOffset(cantidad, cavidad);
  const baseImpresion = resolveImpresionBase(divisiones);
  const precioImpresion = roundCOP(baseImpresion * tintas * millares);

  const precioPlanchas = roundCOP(tintas * PRECIO_PLANCHA);

  // Costos manuales fijos (una vez) + los que se cobran POR MILLAR.
  const costos = input.costos || {};
  const costosFijos = roundCOP(sumCostosFijos(costos));
  const troqueladoMillar = Number(costos.troqueladoMillar) || 0;
  const plastificadoMillar = Number(costos.plastificadoMillar) || 0;
  const troquelado = roundCOP(troqueladoMillar * millares);
  const plastificado = roundCOP(plastificadoMillar * millares);
  const costosManuales = costosFijos + troquelado + plastificado;

  // Subtotal con precisión completa (el papel puede traer medio pliego) y se
  // redondea solo para mostrar; la ganancia se saca del subtotal exacto.
  const subtotalRaw =
    precioPliegosRaw + precioPlanchas + precioImpresion + costosManuales;
  const subtotalCostos = roundCOP(subtotalRaw);

  // Ganancia: interna (margen). El % NO se persiste en el documento, pero el
  // total resultante sí (es el valor cotizado al cliente).
  const ganancia = roundCOP(subtotalRaw * (porcentajeGanancia / 100));
  const totalCotizar = subtotalCostos + ganancia;
  const valorUnitario = roundCOP(totalCotizar / cantidad);

  return {
    cantidad,
    divisiones,
    cavidad,
    tintas,
    precioPapel,
    unidadesPorPliego,
    millares,
    baseImpresion,
    precioPlancha: PRECIO_PLANCHA,
    // Costos.
    pliegos,
    precioPliegos,
    precioPlanchas,
    precioImpresion,
    // Costos manuales: fijos + por millar (troquelado/plastificado = tarifa × millares).
    costosFijos,
    troqueladoMillar,
    plastificadoMillar,
    troquelado,
    plastificado,
    costosManuales,
    subtotalCostos,
    // Margen (interno) + resultado.
    porcentajeGanancia,
    ganancia,
    totalCotizar,
    valorUnitario,
  };
};
