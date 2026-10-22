import express from "express";
import http from "http";
import morgan from "morgan";
import { config } from "dotenv";
import { connectDB, disconnectDB } from "./config/db.js";
import { connectMongo, disconnectMongo, getMongoState } from "./config/mongo.js";
import { syncSecurity } from "./bootstrap/syncSecurity.js";
import cookieParser from "cookie-parser";
import cors from "cors";

import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";
import roleRoutes from "./routes/role.routes.js";
import measureRoutes from "./routes/measures.routes.js";
import formatRoutes from "./routes/formats.routes.js";
import thirdsRoutes from "./routes/thirds.routes.js";
import troquelesRoutes from "./routes/troqueles.routes.js";
import productsRoutes from "./routes/products.routes.js";
import paperTypeRoutes from "./routes/paper_type.routes.js";
import processesRoutes from "./routes/processes.routes.js";
import machineryRoutes from "./routes/machinery.routes.js";
import serviceLineRoutes from "./routes/service_line.routes.js";
import orderRoutes from "./routes/order.routes.js";
import orderProcessRoutes from "./routes/order_process.routes.js";

config();

const parseAllowedOrigins = () => {
  const envOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (envOrigins?.length) return envOrigins;

  return [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://prograficos.opita.dev",
  ];
};

const allowedOrigins = parseAllowedOrigins();
const socketPath = process.env.SOCKET_IO_PATH || "/socket.io";
const port = Number(process.env.PORT || 5001);

connectDB();
// Store de documentos (Mongo). No bloquea el arranque ni es fatal si falla.
connectMongo();

const app = express();
const server = http.createServer(app);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("CORS bloqueado:", origin);
    return callback(new Error("No permitido por CORS"));
  },
  credentials: true,
};

const createSocketServer = async () => {
  try {
    const { Server } = await import("socket.io");
    return new Server(server, {
      cors: corsOptions,
      path: socketPath,
    });
  } catch (error) {
    console.warn(
      "Socket.IO no está disponible en este entorno. El servidor seguirá funcionando sin eventos en tiempo real.",
    );
    console.warn(error?.message || error);
    return null;
  }
};

const io = await createSocketServer();

app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use((req, _res, next) => {
  req.io = io;
  next();
});

if (io) {
  io.on("connection", (socket) => {
    console.log(`Socket conectado: ${socket.id}`);

    socket.on("disconnect", () => {
      console.log(`Socket desconectado: ${socket.id}`);
    });
  });
}

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    mongo: getMongoState(),
  });
});

app.use("/users", userRoutes);
app.use("/auth", authRoutes);
app.use("/roles", roleRoutes);
app.use("/measures", measureRoutes);
app.use("/formats", formatRoutes);
app.use("/thirds", thirdsRoutes);
app.use("/troqueles", troquelesRoutes);
app.use("/products", productsRoutes);
app.use("/paper_types", paperTypeRoutes);
app.use("/processes", processesRoutes);
app.use("/machinery", machineryRoutes);
app.use("/service-lines", serviceLineRoutes);
app.use("/order", orderRoutes);
app.use("/order-processes", orderProcessRoutes);

// Sincroniza roles/permisos del sistema (idempotente) antes de escuchar.
try {
  await syncSecurity();
  console.log("Seguridad sincronizada (roles y permisos) ✅");
} catch (error) {
  console.error("Error al sincronizar la seguridad:", error?.message || error);
}

server.listen(port, () => {
  console.log(`Server running on port ${port} 🚀`);
  if (io) {
    console.log(`Socket.IO path: ${socketPath}`);
  }
});

// Cierre ordenado de las dependencias (Postgres/Prisma + Mongo).
const closeConnections = async () => {
  await Promise.allSettled([disconnectDB(), disconnectMongo()]);
};

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  server.close(async () => {
    await closeConnections();
    process.exit(1);
  });
});

process.on("uncaughtException", async (err) => {
  console.error("Uncaught Exception:", err);
  await closeConnections();
  process.exit(1);
});

const gracefulShutdown = (signal) => {
  console.log(`${signal} received, shutting down gracefully`);
  server.close(async () => {
    await closeConnections();
    process.exit(0);
  });
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
