import { Router } from "express";
import { getVideoInfo, downloadVideo } from "../controllers/videoController.js";
const router = Router();

router.get("/info", getVideoInfo);
router.post("/download", downloadVideo);

export default router;