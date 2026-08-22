"use client";

import { useEffect } from "react";
import { useExperience } from "@/lib/store";
import styles from "./ui.module.css";

export default function ToastNotification() {
  const toast = useExperience((s) => s.toast);
  const clearToast = useExperience((s) => s.clearToast);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      clearToast();
    }, 3200);
    return () => clearTimeout(timer);
  }, [toast, clearToast]);

  if (!toast) return null;

  return (
    <div className={`${styles.toastWrap} ${styles[toast.type || "info"]}`} role="status" aria-live="polite">
      <span className={styles.toastGlow} />
      <span className={styles.toastIcon}>
        {toast.type === "success" ? "✓" : toast.type === "warning" ? "!" : "◈"}
      </span>
      <span className={styles.toastText}>{toast.message}</span>
      <button type="button" className={styles.toastClose} onClick={clearToast} aria-label="Dismiss toast">
        ✕
      </button>
    </div>
  );
}
