import express from "express";
import cors from "cors";
import { CLIENT_ORIGIN, DOWNLOADS_DIR, DOWNLOADS_ROUTE } from "./config/index.js";
import videoRoutes from "./routes/videoRoutes.js";
import fs from "fs";
import path from "path";

// ensure downloads folder exists
if (!fs.existsSync(DOWNLOADS_DIR)) {
  fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
}

const app = express();

// ─── middleware ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin.endsWith(".vercel.app") || origin === process.env.CLIENT_ORIGIN) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  }
}));
app.use(express.json());

// ─── static ──────────────────────────────────────────────────────────────────
app.use(DOWNLOADS_ROUTE, (req, res, next) => {
  res.setHeader("Content-Disposition", "attachment");
  next();
}, express.static(DOWNLOADS_DIR));

// ─── routes ──────────────────────────────────────────────────────────────────
app.use("/api/video", videoRoutes);

// ─── health check ────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));



export default app;