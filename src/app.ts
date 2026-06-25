import "reflect-metadata";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./Modules/Routes/auth.routes";
import articleRoutes from "./Modules/Routes/articles.routes";
import categoryRoutes from "./Modules/Routes/categories.routes";
import videoRoutes from "./Modules/Routes/video.routes";
import siteSettingsRoutes from "./Modules/Routes/siteSettings.routes";
import auditLogRoutes from "./Modules/Routes/auditLog.routes";
import authorRoutes from "./Modules/Routes/author.routes";

declare module "express";
declare module "cors";
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/authors", authorRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/site-settings", siteSettingsRoutes);
app.use("/api/audit-logs", auditLogRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Sphere Tech API is running",
    version: "1.0.0",
  });
});

export default app;