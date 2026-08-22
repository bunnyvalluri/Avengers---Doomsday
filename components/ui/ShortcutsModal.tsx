"use client";

import { useEffect } from "react";
import { useExperience } from "@/lib/store";
import { soundEngine } from "@/lib/soundEngine";
import styles from "./modal.module.css";

const SHORTCUTS = [
  { key: "SPACE", desc: "Toggle Hands-Free Cinema Auto-Tour", category: "Playback" },
  { key: "↓ / J", desc: "Jump to Next Chapter", category: "Navigation" },
  { key: "↑ / K", desc: "Jump to Previous Chapter", category: "Navigation" },
  { key: "M", desc: "Toggle Ambient Web Audio Synth", category: "Audio" },
  { key: "T", desc: "Open VIP Ticket Reservation & Seat Picker", category: "Experience" },
  { key: "D", desc: "Inspect Featured Character Dossier", category: "Lore" },
  { key: "~ / `", desc: "Decrypt Secret Multiverse Terminal", category: "Secrets" },
  { key: "F", desc: "Toggle Fullscreen Immersion", category: "Display" },
  { key: "R", desc: "Rewind Saga to Chapter 1 (The Void)", category: "Navigation" },
  { key: "? / /", desc: "Show / Hide Keyboard Controls", category: "Help" },
  { key: "ESC", desc: "Close Active Modals & Overlays", category: "General" },
];

export default function ShortcutsModal() {
  const open = useExperience((s) => s.shortcutsModalOpen);
  const setOpen = useExperience((s) => s.setShortcutsModalOpen);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
        soundEngine.playClick();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div className={styles.backdrop} onClick={() => setOpen(false)} aria-modal="true" role="dialog">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: "620px" }}>
        <button
          className={styles.closeBtn}
          onClick={() => {
            setOpen(false);
            soundEngine.playClick();
          }}
          aria-label="Close shortcuts modal"
        >
          ✕
        </button>

        <div className={styles.header}>
          <div className={styles.kicker}>HUD Command Matrix</div>
          <h2 className={styles.title}>KEYBOARD SHORTCUTS</h2>
          <p className={styles.subtitle}>Direct control keys for the Avengers: Doomsday experience</p>
        </div>

        <div className={styles.shortcutsList}>
          {SHORTCUTS.map((s, idx) => (
            <div key={idx} className={styles.shortcutRow}>
              <div className={styles.shortcutKeyWrap}>
                <kbd className={styles.kbd}>{s.key}</kbd>
              </div>
              <div className={styles.shortcutDescWrap}>
                <span className={styles.shortcutDesc}>{s.desc}</span>
                <span className={styles.shortcutCat}>{s.category}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "24px", textAlign: "center" }}>
          <button
            type="button"
            className={styles.submitBtn}
            style={{ width: "100%" }}
            onClick={() => {
              setOpen(false);
              soundEngine.playClick();
            }}
          >
            Acknowledge &amp; Return
          </button>
        </div>
      </div>
    </div>
  );
}
