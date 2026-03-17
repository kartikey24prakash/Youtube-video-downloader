import styles from "./DownloadHistory.module.css";

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function DownloadHistory({ history, onClear }) {
  if (!history.length) return null;

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.label}>Recent</span>
        <button className={styles.clearBtn} onClick={onClear}>Clear</button>
      </div>
      <div className={styles.list}>
        {history.map((item) => (
          <div key={item.ts} className={styles.item}>
            <img src={item.thumbnail} alt="" className={styles.thumb} />
            <div className={styles.meta}>
              <p className={styles.title}>{item.title}</p>
              <div className={styles.row}>
                <span className={styles.type}>{item.type === "audio" ? "MP3" : "MP4"}</span>
                <span className={styles.time}>{timeAgo(item.ts)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}