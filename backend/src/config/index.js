import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const PORT = process.env.PORT || 5000;
export const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";
export const FFMPEG_PATH = process.env.FFMPEG_PATH || "ffmpeg";
export const DOWNLOADS_DIR = path.join(__dirname, "../../downloads");
export const DOWNLOADS_ROUTE = "/downloads";
export const MAX_FORMATS = 10;