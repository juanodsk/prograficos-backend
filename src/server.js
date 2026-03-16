import express from "express";
import morgan from "morgan";
import { config } from "dotenv";
import { connectDB, disconnectDB } from "./config/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";

//IMPORT ROUTES//
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

// SERVER CONFIGURATION//

config();
connectDB();
const app = express();
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://prograficos.opita.dev",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("CORS bloqueado:", origin);

      return callback(new Error("No permitido por CORS"));
    },
    credentials: true,
  }),
);

const PORT = 5001;

//BODY PARSING MIDDLEWARES//
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
//API ROUTES//
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

//PORT LISTENING//
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});

// Handle unhandled promise rejections (e.g., database connection errors)
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  server.close(async () => {
    await disconnectDB();
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", async (err) => {
  console.error("Uncaught Exception:", err);
  await disconnectDB();
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(async () => {
    await disconnectDB();
    process.exit(0);
  });
});
