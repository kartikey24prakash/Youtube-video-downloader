import "dotenv/config";
import app from "./app.js";
import { PORT } from "./config/index.js";

app.listen(PORT, () => {
  console.log(`🚀  Backend running → http://localhost:${PORT}`);
  console.log(`     Health  → http://localhost:${PORT}/api/health`);
  console.log(`     Info    → GET  /api/video/info?url=<yt-url>`);
  console.log(`     Download→ POST /api/video/download`);
});