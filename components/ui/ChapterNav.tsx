"use client";

import { useRef, useState } from "react";
import { signals } from "@/lib/signals";
import { CHAPTERS_NAV } from "@/lib/constants";
import { useRaf } from "@/lib/useRaf";
import styles from "./chapter.module.css";

export default function ChapterNav() {
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  useRaf(() => {
    const s = signals.scroll;
    const wrap = wrapRef.current;
    if (!wrap) return;

    // Subtle fade in after initial void
    wrap.style.opacity = s > 0.02 ? "1" : "0.3";

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
      {CHAPTERS_NAV.map((ch, idx) => (
        <button
          key={ch.id}
          type="button"
          className={`${styles.item} ${activeIndex === idx ? styles.active : ""}`}
          onClick={() => jumpTo(ch.progress)}
          aria-label={`Jump to ${ch.name}`}
          title={ch.name}
        >
          <span className={styles.label}>{ch.name}</span>
          <span className={styles.dot} />
        </button>
      ))}
    </nav>
  );
}
