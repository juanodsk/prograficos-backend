import mongoose from "mongoose";

// Conexión a MongoDB (vía Mongoose) para el almacén de documentos
// (cotizaciones y, a futuro, otros documentos). Convive con Postgres/Prisma:
// Mongo es un store secundario y aislado, por eso su caída NO debe tumbar el
// resto de la API (órdenes, catálogos, etc.). Mantiene una única conexión
// (singleton de Mongoose) reutilizada por todo el proceso.

// Consultas predecibles: ignora campos no declarados en el esquema al filtrar.
mongoose.set("strictQuery", true);

let isConnecting = false;

const readyStateLabels = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
};

// Estado legible de la conexión (para el health check / observabilidad).
export const getMongoState = () =>
  readyStateLabels[mongoose.connection.readyState] ?? "unknown";

export const isMongoConnected = () => mongoose.connection.readyState === 1;

// Conecta a Mongo de forma idempotente: si ya está conectado o conectando,
// no abre una segunda conexión. No es fatal: ante fallo, loguea y continúa.
export const connectMongo = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.warn(
      "MONGO_URI no está definida. El almacén de documentos (Mongo) queda deshabilitado.",
    );
    return false;
  }

  if (isMongoConnected() || isConnecting) {
    return isMongoConnected();
  }

  try {
    isConnecting = true;
    await mongoose.connect(uri, {
      // Falla rápido si Mongo no responde, en vez de colgarse ~30s.
      serverSelectionTimeoutMS: 5000,
    });
    console.log("Connected to MongoDB (documentos)");
    return true;
  } catch (error) {
    console.error(`MongoDB connection error: ${error?.message || error}`);
    return false;
  } finally {
    isConnecting = false;
  }
};

export const disconnectMongo = async () => {
  if (mongoose.connection.readyState === 0) return;
  await mongoose.connection.close();
};

// Observabilidad: eventos de la conexión (reconexión, pérdida, errores).
mongoose.connection.on("connected", () => {
  console.log("MongoDB: conexión establecida");
});

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB: conexión perdida");
});

mongoose.connection.on("error", (error) => {
  console.error("MongoDB: error de conexión:", error?.message || error);
});

export { mongoose };
