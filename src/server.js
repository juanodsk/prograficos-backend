import express from "express";
import http from "http";
import morgan from "morgan";
import { config } from "dotenv";
import { connectDB, disconnectDB } from "./config/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";

import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";
import measureRoutes from "./routes/measures.routes.js";
import formatRoutes from "./routes/formats.routes.js";
import thirdsRoutes from "./routes/thirds.routes.js";
import troquelesRoutes from "./routes/troqueles.routes.js";
import productsRoutes from "./routes/products.routes.js";
import productCustomerRoutes from "./routes/product_customer.routes.js";
import paperTypeRoutes from "./routes/paper_type.routes.js";
import processesRoutes from "./routes/processes.routes.js";
import machineryRoutes from "./routes/machinery.routes.js";
import orderRoutes from "./routes/order.routes.js";
import orderProcessRoutes from "./routes/order_process.routes.js";

config();

const parseAllowedOrigins = () => {
  const envOrigins = process.env.CORS_ALLOWED_ORIGINS
    ?.split(",")
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
app.use(express.json({ limit: "50mb" })); // suficiente para Base64 grande, si realmente quieres seguir usando JSON
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

app.use("/users", userRoutes);
app.use("/auth", authRoutes);
app.use("/measures", measureRoutes);
app.use("/formats", formatRoutes);
app.use("/thirds", thirdsRoutes);
app.use("/troqueles", troquelesRoutes);
app.use("/products", productsRoutes);
app.use("/product_customers", productCustomerRoutes);
app.use("/paper_types", paperTypeRoutes);
app.use("/processes", processesRoutes);
app.use("/machinery", machineryRoutes);
app.use("/order", orderRoutes);
app.use("/order-processes", orderProcessRoutes);

server.listen(port, () => {
  console.log(`Server running on port ${port} 🚀`);
  if (io) {
    console.log(`Socket.IO path: ${socketPath}`);
  }
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  server.close(async () => {
    await disconnectDB();
    process.exit(1);
  });
});

process.on("uncaughtException", async (err) => {
  console.error("Uncaught Exception:", err);
  await disconnectDB();
  process.exit(1);
});

process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(async () => {
    await disconnectDB();
    process.exit(0);
  });
});
