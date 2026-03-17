import styles from "./FormatPicker.module.css";

function formatSize(bytes) {
  if (!bytes) return null;
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(0)}MB`;
  return `${(bytes / 1_000).toFixed(0)}KB`;
}

export default function FormatPicker({ formats, selected, onSelect, downloadType, onTypeChange }) {
  const videoFormats = formats.filter((f) => f.vcodec !== "none");
  const audioFormats = formats.filter((f) => f.vcodec === "none");

  return (
    <div className={styles.wrapper}>
      {/* Type toggle */}
      <div className={styles.typeRow}>
        <button
          className={`${styles.typeBtn} ${downloadType === "video" ? styles.typeActive : ""}`}
          onClick={() => onTypeChange("video")}
        >
          Video
        </button>
        <button
          className={`${styles.typeBtn} ${downloadType === "audio" ? styles.typeActive : ""}`}
          onClick={() => onTypeChange("audio")}
        >
          Audio (MP3)
        </button>
      </div>

      {/* Format chips */}
      {downloadType === "video" && videoFormats.length > 0 && (
        <div className={styles.section}>
          <p className={styles.label}>Quality</p>
          <div className={styles.chips}>
            {videoFormats.map((f) => (
              <button
                key={f.format_id}
                className={`${styles.chip} ${selected === f.format_id ? styles.chipActive : ""}`}
                onClick={() => onSelect(f.format_id)}
              >
                <span className={styles.res}>{f.resolution}</span>
                <span className={styles.ext}>{f.ext.toUpperCase()}</span>
                {f.filesize && <span className={styles.size}>{formatSize(f.filesize)}</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {downloadType === "audio" && (
        <div className={styles.section}>
          <p className={styles.label}>Format</p>
          <div className={styles.chips}>
            <button className={`${styles.chip} ${styles.chipActive}`}>
              <span className={styles.res}>MP3</span>
              <span className={styles.ext}>Best Quality</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
