import mongoose from "mongoose";

// Numeración de cotizaciones: COT-YYYY-#### (reinicia por año).
// Mongo no tiene autoincrement, así que usamos un contador propio con un
// incremento ATÓMICO (findOneAndUpdate + $inc + upsert). Esto garantiza
// idempotencia frente a concurrencia: dos cotizaciones creadas a la vez nunca
// obtienen el mismo número.

const counterSchema = new mongoose.Schema(
  {
    // _id = "quotation-2026" (un contador por año).
    _id: { type: String, required: true },
    seq: { type: Number, required: true, default: 0 },
  },
  { collection: "counters", versionKey: false },
);

const Counter = mongoose.model("Counter", counterSchema);

const QUOTE_PREFIX = "COT";
const SEQUENCE_PADDING = 4; // COT-YYYY-9999

// Devuelve el siguiente número de cotización para el año dado y el consecutivo.
// Reserva el consecutivo de forma atómica antes de crear el documento.
export const getNextQuoteNumber = async (year = new Date().getFullYear()) => {
  const counter = await Counter.findOneAndUpdate(
    { _id: `quotation-${year}` },
    { $inc: { seq: 1 } },
    { returnDocument: "after", upsert: true, setDefaultsOnInsert: true },
  );

  const sequence = counter.seq;
  const quoteNumber = `${QUOTE_PREFIX}-${year}-${String(sequence).padStart(
    SEQUENCE_PADDING,
    "0",
  )}`;

  return { quoteNumber, year, sequence };
};

export { Counter };
