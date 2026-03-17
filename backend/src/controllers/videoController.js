import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import { DOWNLOADS_DIR, MAX_FORMATS, FFMPEG_PATH } from "../config/index.js";

const execAsync = promisify(exec);
const COOKIES = "/opt/render/project/src/backend/cookies.txt";

const YT_ARGS = `--extractor-args "youtube:player_client=android,web" -f "bv*+ba/b"`;
function buildFormatList(rawFormats = []) {
  return rawFormats
    .filter((f) => f.ext && (f.vcodec !== "none" || f.acodec !== "none"))
    .map((f) => ({
      format_id: f.format_id,
      ext: f.ext,
      resolution: f.resolution || (f.height ? `${f.height}p` : "audio only"),
      filesize: f.filesize || f.filesize_approx || null,
      vcodec: f.vcodec,
      acodec: f.acodec,
      format_note: f.format_note || "",
    }))
    .filter(
      (f, i, arr) =>
        arr.findIndex((x) => x.resolution === f.resolution && x.ext === f.ext) === i
    )
    .slice(0, MAX_FORMATS);
}

function findDownloadedFile(timestamp) {
  const files = fs
    .readdirSync(DOWNLOADS_DIR)
    .filter((f) => f.startsWith(`${timestamp}_`));
  return files[0] || null;
}

function buildDownloadCommand(url, format_id, type, outputTemplate) {
  if (type === "audio") {
    return `yt-dlp --no-playlist ${YT_ARGS} --ffmpeg-location "${FFMPEG_PATH}" -x --audio-format mp3 -o "${outputTemplate}" "${url}"`;
  }
  if (format_id) {
    return `yt-dlp --no-playlist ${YT_ARGS} --ffmpeg-location "${FFMPEG_PATH}" -f "${format_id}+bestaudio/best" --merge-output-format mp4 -o "${outputTemplate}" "${url}"`;
  }
  return `yt-dlp --no-playlist ${YT_ARGS} --ffmpeg-location "${FFMPEG_PATH}" -f "bestvideo+bestaudio/best" --merge-output-format mp4 -o "${outputTemplate}" "${url}"`;
}

export async function getVideoInfo(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "URL is required." });

  try {
    const { stdout } = await execAsync(
      `yt-dlp --dump-json --no-playlist ${YT_ARGS} "${url}"`
    );
    const info = JSON.parse(stdout);
    return res.json({
      title: info.title,
      thumbnail: info.thumbnail,
      duration: info.duration,
      uploader: info.uploader,
      view_count: info.view_count,
      formats: buildFormatList(info.formats),
    });
  } catch (err) {
    console.error("[getVideoInfo]", err.message);
    return res.status(500).json({ error: "Failed to fetch video info. Check the URL." });
  }
}

export async function downloadVideo(req, res) {
  const { url, format_id, type } = req.body;
  if (!url) return res.status(400).json({ error: "URL is required." });

  const timestamp = Date.now();
  const outputTemplate = path.join(DOWNLOADS_DIR, `${timestamp}_%(title)s.%(ext)s`);
  const cmd = buildDownloadCommand(url, format_id, type, outputTemplate);

  try {
    await execAsync(cmd);

    const filename = findDownloadedFile(timestamp);
    if (!filename) throw new Error("File not found after download.");

    const filePath = path.join(DOWNLOADS_DIR, filename);
    res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(filename)}"`);
    res.setHeader("Content-Type", "application/octet-stream");
    return res.sendFile(filePath);

  } catch (err) {
    console.error("[downloadVideo]", err.message);
    return res.status(500).json({ error: "Download failed. Ensure yt-dlp and ffmpeg are installed." });
  }
}