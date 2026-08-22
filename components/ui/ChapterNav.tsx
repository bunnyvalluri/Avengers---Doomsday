"use client";

import { useRef, useState } from "react";
import { signals } from "@/lib/signals";
import { CHAPTERS_NAV } from "@/lib/constants";
import { useRaf } from "@/lib/useRaf";
import { soundEngine } from "@/lib/soundEngine";
import styles from "./chapter.module.css";

export default function ChapterNav() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollPct, setScrollPct] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);

  useRaf(() => {
    const s = signals.scroll;
    const wrap = wrapRef.current;
    if (!wrap) return;

    // Subtle fade in after initial void
    wrap.style.opacity = s > 0.02 ? "1" : "0.3";

    const pct = Math.round(s * 100);
    if (pct !== scrollPct) {
      setScrollPct(pct);
      if (ringRef.current) {
        // stroke-dasharray = 88
        const offset = 88 - (88 * s);
        ringRef.current.style.strokeDashoffset = String(Math.max(0, offset));
      }
    }

    // Find current chapter
    let curr = 0;
    for (let i = 0; i < CHAPTERS_NAV.length; i++) {
      if (s >= CHAPTERS_NAV[i].progress - 0.03) {
        curr = i;
      }
    }
    if (curr !== activeIndex) {
      setActiveIndex(curr);
    }
  });

  const jumpTo = (progress: number) => {
    soundEngine.playTeleport();
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const targetY = progress * totalHeight;

    const lenis = (window as unknown as { __lenis?: { scrollTo: (y: number, opts: { duration: number }) => void } }).__lenis;
    if (lenis && typeof lenis.scrollTo === "function") {
      lenis.scrollTo(targetY, { duration: 1.2 });
    } else {
      window.scrollTo({ top: targetY, behavior: "smooth" });
    }
  };

  return (
    <nav className={styles.navWrap} ref={wrapRef} aria-label="Chapter Navigator">
      <div className={styles.radarCard}>
        <div className={styles.progressRingWrap} title={`Saga Progress: ${scrollPct}%`}>
          <svg className={styles.progressSvg} viewBox="0 0 36 36">
            <circle className={styles.progressBg} cx="18" cy="18" r="14" />
            <circle ref={ringRef} className={styles.progressFill} cx="18" cy="18" r="14" />
          </svg>
          <span className={styles.progressText}>{scrollPct}%</span>
        </div>

        <div className={styles.itemsCol}>
          {CHAPTERS_NAV.map((ch, idx) => (
            <button
              key={ch.id}
              type="button"
              className={`${styles.item} ${activeIndex === idx ? styles.active : ""}`}
              onClick={() => jumpTo(ch.progress)}
              onMouseEnter={() => soundEngine.playHover()}
              aria-label={`Jump to ${ch.name}`}
              title={ch.name}
            >
              <div className={styles.previewCard}>
                <span className={styles.previewKicker}>{`Chapter 0${idx + 1}`}</span>
                <span className={styles.previewTitle}>{ch.name}</span>
                <span className={styles.shortcutHint}>
                  Press <kbd>J</kbd> / <kbd>K</kbd> to skip
                </span>
              </div>
              <span className={styles.dot} />
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
