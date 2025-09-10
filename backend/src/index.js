import express from "express";
import fs from "fs";
import { PrismaClient } from "@prisma/client";
import registerRoute from "./routes/register.js";
import loginRoute from "./routes/login.js";
import profileRoute from "./routes/profile.js";
import treesRoute from "./routes/trees.js";
import treePicturesRoute from "./routes/treepictures.js";
import roadsRoute from "./routes/roads.js";
import roadPicturesRoute from "./routes/roadpictures.js";

import reportsRoute from "./routes/reports.js";
import reportPicturesRoute from "./routes/reportpictures.js";
import cors from "cors";

const app = express();
const prisma = new PrismaClient();

import path from "path";

// allow configuring CORS origin from environment (default: allow all)
const corsOrigin = process.env.CORS_ORIGIN || "*";
app.use(cors({ origin: corsOrigin }));
app.use(express.json());

// Upload directory can be configured via UPLOAD_DIR env var. Default to ./public/uploads
const UPLOAD_DIR =
  process.env.UPLOAD_DIR || path.join(process.cwd(), "public", "uploads");
// ensure upload directory exists (useful on new hosts)
try {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
} catch (err) {
  console.error(`Failed to create upload dir ${UPLOAD_DIR}:`, err);
}

// Serve uploads statically
app.use("/uploads", express.static(UPLOAD_DIR));

// if behind a proxy (Vercel, Heroku, etc.) trust proxy to get correct protocol/client ip
app.set("trust proxy", true);

app.get("/", (req, res) => {
  res.json({ message: "Backend API is running" });
});

// Example: get all trees (assuming model Tree exists)
app.get("/trees", async (req, res) => {
  const trees = await prisma.tree.findMany();
  res.json(trees);
});

// Trees route
app.use("/api/trees", treesRoute);
// TreePictures route
app.use("/api/treepictures", treePicturesRoute);
// Roads route
app.use("/api/roads", roadsRoute);
// RoadPictures route
app.use("/api/roadpictures", roadPicturesRoute);
// Agar upload gambar jalan bisa pakai /api/roads/:id/pictures
app.use("/api/roads", roadPicturesRoute);
// Register route
app.use("/api/register", registerRoute);
// Login route
app.use("/api/login", loginRoute);
// Profile route

// Reports route
app.use("/api/reports", reportsRoute);
app.use("/api/reportpictures", reportPicturesRoute);
app.use("/api/profile", profileRoute);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// graceful shutdown: disconnect Prisma client on exit
const shutdown = async () => {
  console.log("Shutting down server...");
  try {
    await prisma.$disconnect();
    server.close(() => process.exit(0));
  } catch (err) {
    console.error("Error during shutdown", err);
    process.exit(1);
  }
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
