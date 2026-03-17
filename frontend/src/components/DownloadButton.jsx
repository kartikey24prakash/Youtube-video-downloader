import styles from "./DownloadButton.module.css";

export default function DownloadButton({ onClick, loading, downloadType, success }) {
  return (
    <div className={styles.wrapper}>
      <button
        className={styles.btn}
        onClick={onClick}
        disabled={loading}
      >
        {loading ? (
          <>
            <span className={styles.spinner} />
            Downloading...
          </>
        ) : success ? (
          <>
            <span className={styles.icon}>✓</span>
            Downloaded!
          </>
        ) : (
          <>
            <span className={styles.icon}>↓</span>
            Download {downloadType === "audio" ? "MP3" : "Video"}
          </>
        )}
      </button>

      {success && (
        <p className={styles.successMsg}>
          ✓ Download complete · Open with <strong>VLC Media Player</strong> for best playback.
        </p>
      )}
    </div>
  );
}
