import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateOffsetQuotation,
  resolveMillaresOffset,
  resolveImpresionBase,
  PRECIO_PLANCHA,
} from "./quotation.costing.js";

// ─────────────────────────────────────────────────────────────
// Millares (OFFSET): pasadas = cantidad/cavidad, al millar más cercano (la
// mitad sube: 2.5 → 3).
// ─────────────────────────────────────────────────────────────
test("resolveMillaresOffset redondea las pasadas (cantidad/cavidad) al millar", () => {
  // Cavidad 1.
  assert.equal(resolveMillaresOffset(500), 1);
  assert.equal(resolveMillaresOffset(1000), 1);
  assert.equal(resolveMillaresOffset(1050), 1);
  assert.equal(resolveMillaresOffset(1500), 2); // la mitad ahora sube
  assert.equal(resolveMillaresOffset(2300), 2);
  assert.equal(resolveMillaresOffset(2500), 3); // 2.5 → 3
  // Con cavidad: las pasadas son cantidad/cavidad.
  assert.equal(resolveMillaresOffset(5000, 2), 3); // 5000/2 = 2500 → 3
  assert.equal(resolveMillaresOffset(2000, 2), 1); // 2000/2 = 1000 → 1
});

// ─────────────────────────────────────────────────────────────
// Base de impresión según el formato (divisiones del pliego).
// ─────────────────────────────────────────────────────────────
test("resolveImpresionBase cobra más en formatos grandes (<= 1/2 pliego)", () => {
  assert.equal(resolveImpresionBase(1), 40000); // 1 pliego
  assert.equal(resolveImpresionBase(2), 40000); // 1/2 pliego
  assert.equal(resolveImpresionBase(4), 30000); // 1/4 pliego
  assert.equal(resolveImpresionBase(8), 30000); // 1/8 pliego
});

// ─────────────────────────────────────────────────────────────
// Caso "dorado": el ejemplo real del Excel (cliente dogos / caja kinds),
// con las reglas VIGENTES (plancha $25.000).
// ─────────────────────────────────────────────────────────────
test("calculateOffsetQuotation reproduce el ejemplo real (reglas vigentes)", () => {
  const result = calculateOffsetQuotation({
    cantidad: 1050,
    divisiones: 2, // 1/2 pliego
    cavidad: 1,
    precioPapel: 1285,
    tintas: 3,
    porcentajeGanancia: 50,
    costos: {
      diseno: 20000,
      troquel: 140000,
      troqueladoMillar: 40000, // 40.000 × 1 millar = 40.000 (igual que el Excel)
      plastificadoMillar: 0,
      acabados: 20000,
      corte: 0,
      pegado: 50000,
    },
  });

  // Troquelado por millar (1 millar en este caso):
  assert.equal(result.troquelado, 40000);
  assert.equal(result.plastificado, 0);

  // Piezas que coinciden EXACTO con la hoja de Excel:
  assert.equal(result.unidadesPorPliego, 2);
  assert.equal(result.pliegos, 525);
  assert.equal(result.precioPliegos, 674625); // 525 × 1285
  assert.equal(result.millares, 1);
  assert.equal(result.baseImpresion, 40000);
  assert.equal(result.precioImpresion, 120000); // 40000 × 3 × 1

  // Con la plancha vigente ($25.000 → 3 tintas = $75.000):
  assert.equal(result.precioPlanchas, 75000);
  assert.equal(result.costosManuales, 270000);
  assert.equal(result.subtotalCostos, 1139625);
  assert.equal(result.ganancia, 569813); // round(1139625 × 0.5)
  assert.equal(result.totalCotizar, 1709438);
  assert.equal(result.valorUnitario, 1628); // round(1709438 / 1050 = 1628.04)
});

// Segundo ejemplo real (Portaperro Sencillo): 5000 unidades, 1/8 pliego,
// cavidad 2, 1 tinta, ganancia 50%. Prueba millares por pasadas (5000/2=2500→3)
// y el papel sobre la fracción exacta de pliegos (312.5).
test("calculateOffsetQuotation reproduce el ejemplo Portaperro (5000, cav 2, 1/8)", () => {
  const result = calculateOffsetQuotation({
    cantidad: 5000,
    divisiones: 8, // 1/8 pliego
    cavidad: 2,
    precioPapel: 1285,
    tintas: 1,
    porcentajeGanancia: 50,
    costos: {
      diseno: 20000,
      troquel: 50000,
      acabados: 10000,
      troqueladoMillar: 30000,
      plastificadoMillar: 0,
    },
  });

  assert.equal(result.unidadesPorPliego, 16); // 8 × 2
  assert.equal(result.pliegos, 313); // ceil(5000/16 = 312.5)
  assert.equal(result.precioPliegos, 401563); // round(312.5 × 1285)
  assert.equal(result.millares, 3); // 5000/2 = 2500 → 3
  assert.equal(result.baseImpresion, 30000); // 1/8
  assert.equal(result.precioImpresion, 90000); // 30000 × 1 × 3
  assert.equal(result.precioPlanchas, 25000); // 1 tinta
  assert.equal(result.troquelado, 90000); // 30000 × 3
  assert.equal(result.subtotalCostos, 686563); // round(686562.5)
  assert.equal(result.ganancia, 343281); // round(686562.5 × 0.5)
  assert.equal(result.totalCotizar, 1029844);
  assert.equal(result.valorUnitario, 206); // round(1029844 / 5000)
});

// La hoja original mostraba $1.716.938 porque usaba la plancha VIEJA ($80.000
// total). La diferencia con el caso dorado es exactamente $5.000 (80.000 −
// 75.000), confirmando que la única variación es el nuevo precio de plancha.
test("reconciliación: con la plancha vieja ($80.000) daría el total del Excel", () => {
  const result = calculateOffsetQuotation({
    cantidad: 1050,
    divisiones: 2,
    cavidad: 1,
    precioPapel: 1285,
    tintas: 3,
    porcentajeGanancia: 50,
    costos: {
      diseno: 20000,
      troquel: 140000,
      troqueladoMillar: 40000,
      acabados: 20000,
      pegado: 50000,
    },
  });
  const planchaVieja = 80000;
  const subtotalConPlanchaVieja =
    result.subtotalCostos - result.precioPlanchas + planchaVieja;
  const gananciaVieja = Math.round(subtotalConPlanchaVieja * 0.5);
  const totalViejo = subtotalConPlanchaVieja + gananciaVieja;
  assert.equal(subtotalConPlanchaVieja, 1144625);
  assert.equal(totalViejo, 1716938); // = total del Excel
  assert.equal(Math.round(totalViejo / 1050), 1635); // valor unitario del Excel
});

// ─────────────────────────────────────────────────────────────
// Escalamiento con tintas y guardas.
// ─────────────────────────────────────────────────────────────
test("troquelado y plastificado se cobran por millar (tarifa × millares)", () => {
  // 2000 unidades → 2 millares.
  const result = calculateOffsetQuotation({
    cantidad: 2000,
    divisiones: 2,
    cavidad: 1,
    precioPapel: 1000,
    tintas: 1,
    porcentajeGanancia: 0,
    costos: { troqueladoMillar: 30000, plastificadoMillar: 120000 },
  });
  assert.equal(result.millares, 2);
  assert.equal(result.troquelado, 60000); // 30.000 × 2
  assert.equal(result.plastificado, 240000); // 120.000 × 2 (tarifa por millar)
});

test("sin impresión (tintas 0): planchas e impresión en $0", () => {
  const result = calculateOffsetQuotation({
    cantidad: 1000,
    divisiones: 2,
    cavidad: 1,
    precioPapel: 1000,
    tintas: 0,
    porcentajeGanancia: 50,
    costos: { troquel: 50000 },
  });
  assert.equal(result.precioImpresion, 0);
  assert.equal(result.precioPlanchas, 0);
  // Los demás costos sí aplican (p. ej. troquel).
  assert.equal(result.costosFijos, 50000);
});

test("impresión y planchas escalan linealmente con las tintas", () => {
  const base = {
    cantidad: 1000,
    divisiones: 2,
    cavidad: 1,
    precioPapel: 1000,
    porcentajeGanancia: 0,
  };
  const una = calculateOffsetQuotation({ ...base, tintas: 1 });
  const cuatro = calculateOffsetQuotation({ ...base, tintas: 4 });

  assert.equal(una.precioImpresion, 40000); // 40000 × 1 × 1
  assert.equal(cuatro.precioImpresion, 160000); // 40000 × 4 × 1
  assert.equal(una.precioPlanchas, PRECIO_PLANCHA); // 1 tinta = 1 plancha
  assert.equal(cuatro.precioPlanchas, PRECIO_PLANCHA * 4);
});

test("calculateOffsetQuotation rechaza tintas fuera de 0..4", () => {
  const base = {
    cantidad: 1000,
    divisiones: 2,
    cavidad: 1,
    precioPapel: 1000,
    porcentajeGanancia: 0,
  };
  assert.doesNotThrow(() => calculateOffsetQuotation({ ...base, tintas: 0 })); // sin impresión
  assert.throws(() => calculateOffsetQuotation({ ...base, tintas: -1 }));
  assert.throws(() => calculateOffsetQuotation({ ...base, tintas: 5 }));
});

test("calculateOffsetQuotation rechaza cantidad no positiva", () => {
  assert.throws(() =>
    calculateOffsetQuotation({
      cantidad: 0,
      divisiones: 2,
      cavidad: 1,
      precioPapel: 1000,
      tintas: 1,
      porcentajeGanancia: 0,
    }),
  );
});
