import styles from "./VideoInfo.module.css";

function formatDuration(s) {
  if (!s) return "—";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
    : `${m}:${String(sec).padStart(2, "0")}`;
}

function formatViews(n) {
  if (!n) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M views`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K views`;
  return `${n} views`;
}

export default function VideoInfo({ info }) {
  return (
    <div className={styles.card}>
      <div className={styles.thumbWrap}>
        <img src={info.thumbnail} alt={info.title} className={styles.thumb} />
        <span className={styles.duration}>{formatDuration(info.duration)}</span>
      </div>
      <div className={styles.meta}>
        <h2 className={styles.title}>{info.title}</h2>
        <div className={styles.chips}>
          <span className={styles.chip}>{info.uploader}</span>
          <span className={styles.chip}>{formatViews(info.view_count)}</span>
        </div>
      </div>
    </div>
  );
}
