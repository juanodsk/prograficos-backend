import mongoose from "mongoose";

// Documento de cotización (almacén de documentos en Mongo).
// Principio CONGELADO: cada cotización guarda la realidad exacta del momento
// (precios de papel, snapshots de catálogo, totales calculados). No referencia
// en vivo a Postgres: así se reimprime sin recalcular ni consultar la BD
// relacional. `client.thirdId` es una referencia BLANDA (no hay FK entre bases).
//
// Nomenclatura: campos en camelCase (idioma Mongoose) y términos del dominio en
// español, consistentes con el motor de costeo. Colecciones con nombre explícito.

const { Schema } = mongoose;

// Value objects (sub-documentos sin _id propio).
const subDocOptions = { _id: false };

// Línea de servicio (snapshot). Hoy solo OFFSET; el campo deja lugar a otras.
const serviceLineSchema = new Schema(
  {
    id: { type: Number, required: true }, // id en Postgres (service_lines).
    name: { type: String, required: true },
  },
  subDocOptions,
);

// Cliente: existente (referencia blanda al tercero + snapshot) o prospecto.
const clientSchema = new Schema(
  {
    kind: { type: String, enum: ["EXISTING", "PROSPECT"], required: true },
    // Solo EXISTING: id del tercero tipo CLIENTE en Postgres (referencia blanda).
    thirdId: { type: Number, default: null },
    // Snapshot del cliente existente al momento de cotizar.
    snapshot: {
      type: new Schema(
        {
          name: { type: String, default: null },
          companyName: { type: String, default: null },
          documentType: { type: String, default: null },
          documentNumber: { type: String, default: null },
          email: { type: String, default: null },
          prefix: { type: String, default: null },
        },
        subDocOptions,
      ),
      default: null,
    },
    // Solo PROSPECT: datos de contacto capturados (landing / cliente nuevo).
    contact: {
      type: new Schema(
        {
          name: { type: String, default: null },
          company: { type: String, default: null },
          email: { type: String, default: null },
          phone: { type: String, default: null },
        },
        subDocOptions,
      ),
      default: null,
    },
  },
  subDocOptions,
);

// Costos manuales que digita el cotizador (snapshot de las ENTRADAS).
// Fijos (una vez) + tarifas POR MILLAR (troquelado/plastificado).
const manualCostsSchema = new Schema(
  {
    diseno: { type: Number, default: 0 },
    troquel: { type: Number, default: 0 },
    acabados: { type: Number, default: 0 },
    corte: { type: Number, default: 0 },
    pegado: { type: Number, default: 0 },
    // Tarifas por millar (el total se calcula = tarifa × millares).
    troqueladoMillar: { type: Number, default: 0 },
    plastificadoMillar: { type: Number, default: 0 },
  },
  subDocOptions,
);

// Resultado del motor de costeo CONGELADO. OJO: NO se guarda el % de ganancia
// ni el monto de ganancia (margen interno); sí el subtotal, total y unitario.
const costingSchema = new Schema(
  {
    unidadesPorPliego: { type: Number, required: true },
    pliegos: { type: Number, required: true },
    millares: { type: Number, required: true },
    baseImpresion: { type: Number, required: true },
    precioPlancha: { type: Number, required: true },
    precioPliegos: { type: Number, required: true },
    precioPlanchas: { type: Number, required: true },
    precioImpresion: { type: Number, required: true },
    costosFijos: { type: Number, required: true },
    troquelado: { type: Number, required: true }, // tarifa × millares
    plastificado: { type: Number, required: true }, // tarifa × millares
    costosManuales: { type: Number, required: true }, // fijos + troquelado + plastificado
    subtotalCostos: { type: Number, required: true },
    totalCotizar: { type: Number, required: true },
    valorUnitario: { type: Number, required: true },
  },
  subDocOptions,
);

// Un ítem = un producto cotizado (un "análisis" del Excel). Una cotización
// puede llevar varios productos.
const itemSchema = new Schema(
  {
    descripcionProducto: { type: String, required: true },
    cantidad: { type: Number, required: true },
    cavidad: { type: Number, required: true },
    tintas: { type: Number, required: true },
    // Snapshot del papel elegido (con su proveedor y precio del momento).
    papel: {
      type: new Schema(
        {
          paperTypeId: { type: Number, default: null },
          name: { type: String, default: null },
          grammage: { type: Number, default: null },
          supplierThirdId: { type: Number, default: null },
          supplierName: { type: String, default: null },
          precioUnitario: { type: Number, required: true }, // por pliego
        },
        subDocOptions,
      ),
      required: true,
    },
    // Snapshot del formato (divisiones del pliego) y medida.
    formato: {
      type: new Schema(
        {
          formatId: { type: Number, default: null },
          name: { type: String, default: null },
          divisiones: { type: Number, required: true },
        },
        subDocOptions,
      ),
      required: true,
    },
    medida: {
      type: new Schema(
        {
          measureId: { type: Number, default: null },
          label: { type: String, default: null },
        },
        subDocOptions,
      ),
      default: null,
    },
    costosManuales: { type: manualCostsSchema, default: () => ({}) },
    costing: { type: costingSchema, required: true },
  },
  subDocOptions,
);

const quotationSchema = new Schema(
  {
    quoteNumber: { type: String, required: true, unique: true }, // COT-YYYY-####
    year: { type: Number, required: true },
    sequence: { type: Number, required: true },

    source: {
      type: String,
      enum: ["INTERNAL", "LANDING"],
      default: "INTERNAL",
    },
    status: {
      type: String,
      enum: ["BORRADOR", "ENVIADA", "APROBADA", "VENCIDA"],
      default: "BORRADOR",
    },

    serviceLine: { type: serviceLineSchema, required: true },
    client: { type: clientSchema, required: true },

    items: {
      type: [itemSchema],
      validate: {
        validator: (items) => Array.isArray(items) && items.length > 0,
        message: "La cotización debe tener al menos un producto",
      },
    },
    // Suma de los totales de los ítems (valor cotizado al cliente).
    granTotal: { type: Number, required: true },

    fecha: { type: Date, default: Date.now },
    validoHasta: { type: Date, required: true },

    // Conversión a orden (idempotente, en un solo sentido): se setea una vez.
    convertedToOrderId: { type: Number, default: null },

    createdByUserId: { type: Number, default: null }, // id de usuario Postgres.
    isActive: { type: Boolean, default: true }, // borrado lógico.
  },
  {
    collection: "quotations",
    timestamps: true, // createdAt / updatedAt
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
  },
);

// Índices para las consultas frecuentes.
quotationSchema.index({ "client.thirdId": 1 });
quotationSchema.index({ "serviceLine.id": 1 });
quotationSchema.index({ status: 1 });
quotationSchema.index({ isActive: 1, createdAt: -1 });
quotationSchema.index({ year: 1, sequence: 1 });

export const QUOTE_STATUS = Object.freeze({
  BORRADOR: "BORRADOR",
  ENVIADA: "ENVIADA",
  APROBADA: "APROBADA",
  VENCIDA: "VENCIDA",
});

export const QUOTE_SOURCE = Object.freeze({
  INTERNAL: "INTERNAL",
  LANDING: "LANDING",
});

export const Quotation = mongoose.model("Quotation", quotationSchema);
