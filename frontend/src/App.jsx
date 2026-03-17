import { useState } from "react";
import { fetchVideoInfo, downloadVideo } from "./api/videoApi.js";
import SearchBar from "./components/SearchBar.jsx";
import VideoInfo from "./components/VideoInfo.jsx";
import FormatPicker from "./components/FormatPicker.jsx";
import DownloadButton from "./components/DownloadButton.jsx";
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
      a.click();
      setSuccess(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setDlLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
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
      </div>

      <footer className={styles.footer}>
        YTDrop · For personal use only
      </footer>
    </div>
  );
}