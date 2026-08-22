"use client";

import { useRef, useState } from "react";
import { signals } from "@/lib/signals";
import { VIDEO } from "@/lib/constants";
import { useRaf } from "@/lib/useRaf";
import styles from "./ui.module.css";

export default function HeroOverlay() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const [timecode, setTimecode] = useState("00:00.0");

  useRaf(() => {
    const el = wrapRef.current;
    if (!el) return;
    const h = signals.heroOp; // the hero chrome rides in with the video itself
    el.style.opacity = h.toFixed(3);
    el.style.visibility = h < 0.01 ? "hidden" : "visible";
    
    if (barRef.current) {
      const p = Math.min(1, Math.max(0, signals.heroT / VIDEO.heroDur));
      barRef.current.style.transform = `scaleX(${p.toFixed(3)})`;
      
      const secs = signals.heroT;
      const m = Math.floor(secs / 60);
      const s = (secs % 60).toFixed(1);
      const formatted = `0${m}:${Number(s) < 10 ? "0" : ""}${s}`;
      if (formatted !== timecode) {
        setTimecode(formatted);
      }
    }
  });

  return (
    <div ref={wrapRef} className={styles.heroUi} style={{ opacity: 0 }} aria-hidden>
      <div className={styles.heroText}>
        <span className={styles.heroKicker}>Act 01 // Arrival of Doom</span>
        <span style={{ fontSize: "11px", color: "var(--silver)", letterSpacing: "0.14em" }}>
          Frame Scrub Engine Active
        </span>
      </div>
      <div className={styles.heroScrub}>
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
          <span className={styles.heroScrubLabel}>Scroll to direct footage</span>
          <span style={{ fontSize: "10px", color: "var(--green)", fontFamily: "monospace" }}>
            {timecode} / 00:10.6
          </span>
        </div>
        <span className={styles.scrubTrack}>
          <span ref={barRef} className={styles.scrubFill} />
        </span>
      </div>
    </div>
  );
}
