import { useState } from "react";
import { fetchVideoInfo, downloadVideo } from "./api/videoApi.js";
import SearchBar from "./components/SearchBar.jsx";
import VideoInfo from "./components/VideoInfo.jsx";
import FormatPicker from "./components/FormatPicker.jsx";
import DownloadButton from "./components/DownloadButton.jsx";
import ParticleBackground from "./components/ParticleBackground.jsx";
import DownloadHistory from "./components/DownloadHistory.jsx";
import Toast from "./components/Toast.jsx";
import styles from "./App.module.css";

export default function App() {
  const [url, setUrl] = useState("");
  const [info, setInfo] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [dlLoading, setDlLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [downloadType, setDownloadType] = useState("video");
  const [toast, setToast] = useState("");
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("instant_history") || "[]");
    } catch { return []; }
  });

  async function handleFetch(inputUrl) {
    setUrl(inputUrl);
    setFetchLoading(true);
    setError("");
    setInfo(null);
    setSuccess(false);

    try {
      const data = await fetchVideoInfo(inputUrl);
      setInfo(data);
      const first = data.formats?.find((f) => f.vcodec !== "none");
      if (first) setSelectedFormat(first.format_id);
    } catch (e) {
      setError(e.message);
    } finally {
      setFetchLoading(false);
    }
  }

  async function handleDownload() {
    setDlLoading(true);
    setError("");
    setSuccess(false);

    try {
      const data = await downloadVideo({
        url,
        format_id: downloadType === "video" ? selectedFormat : undefined,
        type: downloadType,
      });

      const a = document.createElement("a");
      a.href = data.downloadUrl;
      a.download = data.filename;
      // a.target = "_blank";
      // a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setSuccess(true);
      setToast("Downloaded · History updated");

      const newItem = {
        ts: Date.now(),
        title: info.title,
        thumbnail: info.thumbnail,
        type: downloadType,
      };
      const updated = [newItem, ...history].slice(0, 5);
      setHistory(updated);
      localStorage.setItem("instant_history", JSON.stringify(updated));

    } catch (e) {
      setError(e.message);
    } finally {
      setDlLoading(false);
    }
  }

  function handleClearHistory() {
    setHistory([]);
    localStorage.removeItem("instant_history");
  }

  return (
    <div className={styles.page}>
      <ParticleBackground />

      <div className={styles.content}>
        <nav className={styles.nav}>
          <span className={styles.logo}>Instant</span>
          <span className={styles.navTag}>v1.0</span>
        </nav>

        <main className={styles.main}>
          <SearchBar onFetch={handleFetch} loading={fetchLoading} />

          {error && (
            <div className={styles.error}>
              <span>⚠</span> {error}
            </div>
          )}

          {info && (
            <div className={styles.results}>
              <VideoInfo info={info} />
              <div className={styles.divider} />
              <FormatPicker
                formats={info.formats || []}
                selected={selectedFormat}
                onSelect={setSelectedFormat}
                downloadType={downloadType}
                onTypeChange={(t) => { setDownloadType(t); setSuccess(false); }}
              />
              <div className={styles.divider} />
              <DownloadButton
                onClick={handleDownload}
                loading={dlLoading}
                downloadType={downloadType}
                success={success}
              />
            </div>
          )}

          <DownloadHistory history={history} onClear={handleClearHistory} />
        </main>

        <footer className={styles.footer}>
          Instant · For personal use only
        </footer>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast("")} />}
    </div>
  );
}