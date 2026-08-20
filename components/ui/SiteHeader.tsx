"use client";

import { useRef } from "react";
import { signals } from "@/lib/signals";
import { useRaf } from "@/lib/useRaf";
import styles from "./ui.module.css";

import { useExperience } from "@/lib/store";
import { CHAPTERS_NAV } from "@/lib/constants";

const NAV = [
  { name: "Overview", chapterIndex: 1 },
  { name: "Heroes", chapterIndex: 2 },
  { name: "Story", chapterIndex: 3 },
  { name: "Timeline", chapterIndex: 4 },
];

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export default function SiteHeader() {
  const ref = useRef<HTMLElement>(null);
  const setTicketOpen = useExperience((s) => s.setTicketModalOpen);

  useRaf(() => {
    const el = ref.current;
    if (!el) return;
    const h = signals.header * (1 - smoothstep(0.02, 0.14, signals.reel));
    el.style.opacity = h.toFixed(3);
    el.style.transform = `translateY(${(1 - h) * -20}px)`;
    el.style.pointerEvents = h > 0.6 ? "auto" : "none";
    el.style.visibility = h < 0.01 ? "hidden" : "visible";
  });

  const jumpTo = (chapterIndex: number) => {
    const progress = CHAPTERS_NAV[chapterIndex]?.progress ?? 0;
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
    <header ref={ref} className={styles.header} style={{ opacity: 0, visibility: "hidden" }}>
      <div className={styles.brand} onClick={() => jumpTo(0)} style={{ cursor: "pointer" }}>
        <span className={styles.mark} aria-hidden />
        <span className={styles.brandText}>
          MARVEL<b>STUDIOS</b>
        </span>
      </div>
      <nav className={styles.nav}>
        {NAV.map((n) => (
          <button
            key={n.name}
            type="button"
            className={styles.navLink}
            onClick={() => jumpTo(n.chapterIndex)}
            style={{ background: "transparent", border: "none", cursor: "pointer" }}
          >
            {n.name}
          </button>
        ))}
      </nav>
      <button className={styles.cta} type="button" onClick={() => setTicketOpen(true)}>
        Get Tickets
      </button>
    </header>
  );
}
