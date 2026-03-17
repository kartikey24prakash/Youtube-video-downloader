# YTDrop 🎬

A full-stack YouTube video downloader built with React, Node.js, Express, yt-dlp and ffmpeg.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Downloader | yt-dlp (CLI) |
| Merger | ffmpeg (CLI) |

---

## Project Structure

```
YTDrop/
├── backend/
│   ├── package.json
│   ├── downloads/                  # auto-created at runtime
│   └── src/
│       ├── server.js               # boots HTTP server
│       ├── app.js                  # Express setup, middleware, routes
│       ├── config/
│       │   └── index.js            # PORT, CORS, paths
│       ├── routes/
│       │   └── videoRoutes.js      # GET /info · POST /download
│       └── controllers/
│           └── videoController.js  # business logic
│
├── client/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx                # React entry point
│       └── App.jsx                 # Main UI
│
└── README.md
```

---

## Prerequisites

Install these globally on your system before running the project.

### Python & yt-dlp
```bash
# upgrade pip first
python -m pip install --upgrade pip

# install yt-dlp
pip install yt-dlp

# verify
yt-dlp --version
```

### ffmpeg
```bash
# Windows via winget
winget install ffmpeg

# verify
ffmpeg -version
```

> Both must be accessible from system PATH — Node.js calls them via `child_process.exec()`.

---

## Installation & Setup

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/ytdrop.git
cd ytdrop
```

### 2. Backend
```bash
cd backend
npm install
npm run dev
```
Runs on → `http://localhost:5000`

### 3. Frontend (new terminal)
```bash
cd client
npm install
npm run dev
```
Runs on → `http://localhost:5173`

---

## API Endpoints

### Health Check
```
GET /api/health
```
```json
{ "status": "ok" }
```

---

### Fetch Video Info
```
GET /api/video/info?url=<youtube-url>
```

**Response:**
```json
{
  "title": "Video Title",
  "thumbnail": "https://...",
  "duration": 212,
  "uploader": "Channel Name",
  "view_count": 1500000,
  "formats": [
    {
      "format_id": "137",
      "ext": "mp4",
      "resolution": "1080p",
      "filesize": 102400000
    }
  ]
}
```

---

### Download Video
```
POST /api/video/download
Content-Type: application/json
```

**Body:**
```json
{
  "url": "https://youtube.com/watch?v=...",
  "type": "video",
  "format_id": "137"
}
```

**Download Audio (MP3):**
```json
{
  "url": "https://youtube.com/watch?v=...",
  "type": "audio"
}
```

**Response:**
```json
{
  "success": true,
  "filename": "1234567_Video Title.mp4",
  "downloadUrl": "http://localhost:5000/downloads/1234567_Video Title.mp4"
}
```

---

## How It Works

```
User pastes URL
      │
      ▼
React Frontend (port 5173)
      │  HTTP request
      ▼
Express Backend (port 5000)
      │
      ├── GET /info  → yt-dlp --dump-json  → returns metadata
      │
      └── POST /download
              │
              ├── yt-dlp  → downloads video + audio streams
              │
              └── ffmpeg  → merges into single .mp4
                      │
                      ▼
              backend/downloads/
                      │
                      ▼
              downloadUrl returned to frontend
                      │
                      ▼
              browser auto-downloads the file
```

---

## Dependencies

### Backend
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

### Frontend
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.4.0"
  }
}
```

---

## Notes

- Always use clean YouTube URLs — strip `?list=...` playlist params
- Downloaded files are stored in `backend/downloads/` — add a cleanup cron for production
- For personal use only — respect YouTube ToS
- For production: add rate limiting, authentication, and auto-cleanup of old files