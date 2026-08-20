"use client";

import { useRef } from "react";
import { signals } from "@/lib/signals";
import { useRaf } from "@/lib/useRaf";
import styles from "./footer.module.css";

/**
 * The closing footer — rises from the bottom after the title reveal, driven by
 * `signals.footer`. Minimal + elegant, in the same dark-green cinematic language.
 * Links are placeholders for now.
 */
const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

import { useExperience } from "@/lib/store";
import { CHAPTERS_NAV } from "@/lib/constants";

const NAV = [
  { name: "Overview", chapterIndex: 1 },
  { name: "Heroes", chapterIndex: 2 },
  { name: "Story", chapterIndex: 3 },
  { name: "Timeline", chapterIndex: 4 },
];

export default function SiteFooter() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const footRef = useRef<HTMLElement>(null);
  const setTicketOpen = useExperience((s) => s.setTicketModalOpen);

  useRaf(() => {
    const foot = signals.footer;
    const wrap = wrapRef.current;
    if (!wrap) return;
    if (foot <= 0.0006) {
      if (wrap.style.visibility !== "hidden") wrap.style.visibility = "hidden";
      return;
    }
    wrap.style.visibility = "visible";
    if (footRef.current) {
      footRef.current.style.transform = `translateY(${((1 - foot) * 100).toFixed(2)}%)`;
      footRef.current.style.opacity = smoothstep(0, 0.25, foot).toFixed(3);
    }
  });

  const jumpTo = (chapterIndex: number) => {
    const progress = CHAPTERS_NAV[chapterIndex]?.progress ?? 0;
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const targetY = progress * totalHeight;

    const lenis = (window as unknown as { __lenis?: { scrollTo: (y: number, opts: { duration: number }) => void } }).__lenis;
    if (lenis && typeof lenis.scrollTo === "function") {
      lenis.scrollTo(targetY, { duration: 1.4 });
    } else {
      window.scrollTo({ top: targetY, behavior: "smooth" });
    }
  };

  return (
    <div className={styles.wrap} ref={wrapRef} style={{ visibility: "hidden" }}>
      <footer className={styles.footer} ref={footRef} style={{ opacity: 0 }}>
        <span className={styles.glow} />
        <div className={styles.inner}>
          <div className={styles.brand}>
            <span className={styles.mark} onClick={() => jumpTo(0)} style={{ cursor: "pointer" }}>
              Doomsday<span>.</span>
            </span>
            <span className={styles.tag}>A scroll-driven cinematic concept experience.</span>
            <div style={{ marginTop: "8px" }}>
              <button
                type="button"
                className={styles.cta}
                onClick={() => setTicketOpen(true)}
                style={{
                  background: "linear-gradient(120deg, var(--green), var(--mint))",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  color: "#03140d",
                  fontFamily: "var(--font-ui)",
                  fontWeight: 700,
                  fontSize: "11px",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                Get Tickets
              </button>
            </div>
          </div>

          <nav>
            <div className={styles.colHead}>Explore Chapters</div>
            <div className={styles.links}>
              {NAV.map((l) => (
                <button
                  key={l.name}
                  type="button"
                  onClick={() => jumpTo(l.chapterIndex)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "rgba(224, 244, 236, 0.72)",
                    fontFamily: "var(--font-ui)",
                    fontSize: "13px",
                    letterSpacing: "0.12em",
                    cursor: "pointer",
                    textAlign: "left",
                    padding: 0,
                  }}
                >
                  {l.name}
                </button>
              ))}
              <button
                type="button"
                onClick={() => jumpTo(0)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--green)",
                  fontFamily: "var(--font-ui)",
                  fontSize: "13px",
                  letterSpacing: "0.12em",
                  cursor: "pointer",
                  textAlign: "left",
                  padding: 0,
                  marginTop: "4px",
                }}
              >
                ↺ Replay Experience
              </button>
            </div>
          </nav>

          <div>
            <div className={styles.colHead}>Experience Formats</div>
            <div className={styles.links}>
              <span style={{ fontSize: "12.5px", color: "rgba(224, 244, 236, 0.6)" }}>IMAX 3D with Laser</span>
              <span style={{ fontSize: "12.5px", color: "rgba(224, 244, 236, 0.6)" }}>Dolby Cinema Atmos</span>
              <span style={{ fontSize: "12.5px", color: "rgba(224, 244, 236, 0.6)" }}>4DX Multi-Sensory</span>
              <span style={{ fontSize: "12.5px", color: "rgba(224, 244, 236, 0.6)" }}>ScreenX 270°</span>
            </div>
          </div>
        </div>

        <div className={styles.rule} />
        <div className={styles.base}>
          <span>
            © 2026{" "}
            <a
              href="https://valluri-rahul-portfolio.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.authorLink}
              title="Open VALLURI RAHUL Portfolio"
            >
              VALLURI RAHUL
            </a>
            . All rights reserved. Fan concept, not affiliated with Marvel.
          </span>
          <span>
            Crafted by{" "}
            <a
              href="https://valluri-rahul-portfolio.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.authorLink}
              title="Open VALLURI RAHUL Portfolio"
            >
              VALLURI RAHUL ↗
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
