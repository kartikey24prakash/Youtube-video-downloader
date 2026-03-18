// import { exec } from "child_process";
// import { promisify } from "util";
// import fs from "fs";
// import path from "path";
// import { DOWNLOADS_DIR, MAX_FORMATS, FFMPEG_PATH } from "../config/index.js";

// const execAsync = promisify(exec);
// const COOKIES = "/opt/render/project/src/backend/cookies.txt";

// const YT_ARGS = `--extractor-args "youtube:player_client=android,web" -f "bv*+ba/b"`;
// function buildFormatList(rawFormats = []) {
//   return rawFormats
//     .filter((f) => f.ext && (f.vcodec !== "none" || f.acodec !== "none"))
//     .map((f) => ({
//       format_id: f.format_id,
//       ext: f.ext,
//       resolution: f.resolution || (f.height ? `${f.height}p` : "audio only"),
//       filesize: f.filesize || f.filesize_approx || null,
//       vcodec: f.vcodec,
//       acodec: f.acodec,
//       format_note: f.format_note || "",
//     }))
//     .filter(
//       (f, i, arr) =>
//         arr.findIndex((x) => x.resolution === f.resolution && x.ext === f.ext) === i
//     )
//     .slice(0, MAX_FORMATS);
// }

// function findDownloadedFile(timestamp) {
//   const files = fs
//     .readdirSync(DOWNLOADS_DIR)
//     .filter((f) => f.startsWith(`${timestamp}_`));
//   return files[0] || null;
// }

// function buildDownloadCommand(url, format_id, type, outputTemplate) {
//   if (type === "audio") {
//     return `yt-dlp --no-playlist ${YT_ARGS} --ffmpeg-location "${FFMPEG_PATH}" -x --audio-format mp3 -o "${outputTemplate}" "${url}"`;
//   }
//   if (format_id) {
//     return `yt-dlp --no-playlist ${YT_ARGS} --ffmpeg-location "${FFMPEG_PATH}" -f "${format_id}+bestaudio/best" --merge-output-format mp4 -o "${outputTemplate}" "${url}"`;
//   }
//   return `yt-dlp --no-playlist ${YT_ARGS} --ffmpeg-location "${FFMPEG_PATH}" -f "bestvideo+bestaudio/best" --merge-output-format mp4 -o "${outputTemplate}" "${url}"`;
// }

// export async function getVideoInfo(req, res) {
//   const { url } = req.query;
//   if (!url) return res.status(400).json({ error: "URL is required." });

//   try {
//     const { stdout } = await execAsync(
//       `yt-dlp --dump-json --no-playlist ${YT_ARGS} "${url}"`
//     );
//     const info = JSON.parse(stdout);
//     return res.json({
//       title: info.title,
//       thumbnail: info.thumbnail,
//       duration: info.duration,
//       uploader: info.uploader,
//       view_count: info.view_count,
//       formats: buildFormatList(info.formats),
//     });
//   } catch (err) {
//     console.error("[getVideoInfo]", err.message);
//     return res.status(500).json({ error: "Failed to fetch video info. Check the URL." });
//   }
// }

// export async function downloadVideo(req, res) {
//   const { url, format_id, type } = req.body;
//   if (!url) return res.status(400).json({ error: "URL is required." });

//   const timestamp = Date.now();
//   const outputTemplate = path.join(DOWNLOADS_DIR, `${timestamp}_%(title)s.%(ext)s`);
//   const cmd = buildDownloadCommand(url, format_id, type, outputTemplate);

//   try {
//     await execAsync(cmd);

//     const filename = findDownloadedFile(timestamp);
//     if (!filename) throw new Error("File not found after download.");

//     const filePath = path.join(DOWNLOADS_DIR, filename);
//     res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(filename)}"`);
//     res.setHeader("Content-Type", "application/octet-stream");
//     return res.sendFile(filePath);

//   } catch (err) {
//     console.error("[downloadVideo]", err.message);
//     return res.status(500).json({ error: "Download failed. Ensure yt-dlp and ffmpeg are installed." });
//   }
// }
import { DOWNLOADS_DIR, RAPIDAPI_KEY } from "../config/index.js";
import fs from "fs";
import path from "path";

const RAPID_HOST = "youtube-info-download-api.p.rapidapi.com";
const RAPID_HEADERS = {
  "Content-Type": "application/json",
  "x-rapidapi-host": RAPID_HOST,
  "x-rapidapi-key": RAPIDAPI_KEY,
};

// poll progress_url until done
async function pollProgress(progressUrl, maxAttempts = 20) {
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(progressUrl);
    const data = await res.json();
    if (data.progress === 1000 && data.download_url) {
      return data.download_url;
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error("Download timed out.");
}

export async function getVideoInfo(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "URL is required." });

  try {
    const response = await fetch(
      `https://${RAPID_HOST}/ajax/api.php?function=i&u=${encodeURIComponent(url)}`,
      { headers: RAPID_HEADERS }
    );
    const data = await response.json();

    // extract video ID for thumbnail
    const videoId = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1];
    const thumbnail = videoId
      ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
      : data.thumbnail;

    return res.json({
      title: data.title,
      thumbnail,
      duration: data.duration,
      uploader: data.channel?.name || "Unknown",
      view_count: data.viewCount,
      formats: [
        { format_id: "1080", ext: "mp4", resolution: "1080p", filesize: null, vcodec: "avc1", acodec: "mp4a", format_note: "FHD" },
        { format_id: "720", ext: "mp4", resolution: "720p", filesize: null, vcodec: "avc1", acodec: "mp4a", format_note: "HD" },
        { format_id: "480", ext: "mp4", resolution: "480p", filesize: null, vcodec: "avc1", acodec: "mp4a", format_note: "SD" },
        { format_id: "360", ext: "mp4", resolution: "360p", filesize: null, vcodec: "avc1", acodec: "mp4a", format_note: "SD" },
      ],
    });
  } catch (err) {
    console.error("[getVideoInfo]", err.message);
    return res.status(500).json({ error: "Failed to fetch video info." });
  }
}

export async function downloadVideo(req, res) {
  const { url, format_id, type } = req.body;
  if (!url) return res.status(400).json({ error: "URL is required." });

  try {
    const format = type === "audio" ? "mp3" : (format_id || "720");
    const response = await fetch(
      `https://${RAPID_HOST}/ajax/download.php?format=${format}&url=${encodeURIComponent(url)}`,
      { headers: RAPID_HEADERS }
    );
    const data = await response.json();
    console.log("[downloadVideo] API response:", JSON.stringify(data));

    if (!data.success) throw new Error("Download request failed.");

    const downloadUrl = await pollProgress(data.progress_url);

    return res.json({
      success: true,
      filename: `video.${format}`,
      downloadUrl,
    });
  } catch (err) {
    console.error("[downloadVideo]", err.message);
    return res.status(500).json({ error: "Download failed." });
  }
}