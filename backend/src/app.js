import express from "express";
import cors from "cors";
import { CLIENT_ORIGIN, DOWNLOADS_DIR, DOWNLOADS_ROUTE } from "./config/index.js";
import videoRoutes from "./routes/videoRoutes.js";
import fs from "fs";

// ensure downloads folder exists
if (!fs.existsSync(DOWNLOADS_DIR)) {
  fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
}

const app = express();

// ─── middleware ──────────────────────────────────────────────────────────────
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

// ─── static ──────────────────────────────────────────────────────────────────
app.use(DOWNLOADS_ROUTE, express.static(DOWNLOADS_DIR));

// ─── routes ──────────────────────────────────────────────────────────────────
app.use("/api/video", videoRoutes);

// ─── health check ────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

export default app;