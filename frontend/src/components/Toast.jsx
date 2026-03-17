import { useEffect } from "react";
import styles from "./Toast.module.css";

export default function Toast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={styles.toast}>
      <span className={styles.icon}>✓</span>
      {message}
    </div>
  );
}