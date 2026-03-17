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
            <div className={styles.badge}>YouTube Downloader</div>
            <h1 className={styles.title}>
                Download YT video,<br /><span className={styles.accent}>instantly.</span>
            </h1>
            <p className={styles.sub}>Paste a YouTube link and get your video in seconds.</p>

            <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.inputWrap}>
                    <svg className={styles.linkIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                    <input
                        className={styles.input}
                        type="text"
                        placeholder="https://youtube.com/watch?v=..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        disabled={loading}
                    />
                    <button
                        type="button"
                        className={styles.pasteBtn}
                        onClick={async () => {
                            try {
                                const text = await navigator.clipboard.readText();
                                setUrl(text);
                            } catch {
                                alert("Allow clipboard access to use this.");
                            }
                        }}
                    >
                        Paste
                    </button>
                </div>
                <button className={styles.btn} type="submit" disabled={loading || !url.trim()}>
                    {loading ? <span className={styles.spinner} /> : "Download"}
                </button>
            </form>

            <div className={styles.hints}>
                <span className={styles.hint}><span className={styles.dot} />MP4 Video</span>
                <span className={styles.hint}><span className={styles.dot} />MP3 Audio</span>
                <span className={styles.hint}><span className={styles.dot} />HD Quality</span>
            </div>
        </div>
    );
}