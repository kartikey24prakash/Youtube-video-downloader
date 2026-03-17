import { useState } from "react";
import styles from "./SearchBar.module.css";

export default function SearchBar({ onFetch, loading }) {
  const [url, setUrl] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (url.trim()) onFetch(url.trim());
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.hero}>
        <h1 className={styles.title}>YTDrop</h1>
        <p className={styles.sub}>Paste a YouTube URL and download in seconds.</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          className={styles.input}
          type="text"
          placeholder="https://youtube.com/watch?v=..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
        />
        <button className={styles.btn} type="submit" disabled={loading || !url.trim()}>
          {loading ? <span className={styles.spinner} /> : "Fetch"}
        </button>
      </form>
    </div>
  );
}
