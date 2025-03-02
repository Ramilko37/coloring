import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import errorMiddleware from "./middleware/error.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import userRoutes from "./routes/userRoutes.js";

// Config
dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB: " + err);
  });

const app = express();

// Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(/[\s,]+/).filter(Boolean)
        : [
            "http://localhost:3000",
            "http://localhost:5173",
            "https://coloring-book-69f4e.web.app",
          ];

      console.log("Request Origin:", origin);
      console.log("Allowed Origins:", allowedOrigins);

      // Разрешаем запросы без origin (локальные запросы, Postman и т.д.)
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, origin || allowedOrigins[0]); // Используем первый allowed origin если origin не указан
      } else {
        callback(null, allowedOrigins[0]); // Используем первый allowed origin для запросов с неразрешенных доменов
      }
    },
    credentials: true,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/favorites", favoriteRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("API is running");
});

// Error Middleware
app.use(errorMiddleware);

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
