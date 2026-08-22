"use client";

import { useRef, useState } from "react";
import { signals } from "@/lib/signals";
import { useRaf } from "@/lib/useRaf";
import { useExperience } from "@/lib/store";
import { CHAPTERS_NAV } from "@/lib/constants";
import { soundEngine } from "@/lib/soundEngine";
import styles from "./footer.module.css";

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

const NAV = [
  { name: "Overview", chapterIndex: 1 },
  { name: "Heroes", chapterIndex: 2 },
  { name: "Story", chapterIndex: 3 },
  { name: "Timeline", chapterIndex: 4 },
  { name: "Finale", chapterIndex: 5 },
];

export default function SiteFooter() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const footRef = useRef<HTMLElement>(null);
  const setTicketOpen = useExperience((s) => s.setTicketModalOpen);
  const setTerminalOpen = useExperience((s) => s.setDossierTerminalOpen);
  const setShortcutsOpen = useExperience((s) => s.setShortcutsModalOpen);
  const setCinemaTourActive = useExperience((s) => s.setCinemaTourActive);
  const showToast = useExperience((s) => s.showToast);

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

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
    soundEngine.playTeleport();
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

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    soundEngine.playSuccess();
    setSubscribed(true);
    showToast("Subscribed to Exclusive Marvel Doomsday Dispatch!", "success");
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
            <span className={styles.tag}>
              An Awwwards-caliber scroll-driven cinematic experience. The multiverse is breaking. Only legends remain.
            </span>
            <div style={{ display: "flex", gap: "8px", marginTop: "8px", flexWrap: "wrap" }}>
              <button
                type="button"
                className={styles.cta}
                onClick={() => {
                  soundEngine.playClick();
                  setTicketOpen(true);
                }}
                style={{
                  background: "linear-gradient(120deg, var(--green), var(--mint))",
                  border: "none",
                  padding: "8px 18px",
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
                Get VIP Tickets
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playDecryption();
                  setTerminalOpen(true);
                }}
                style={{
                  background: "rgba(0, 255, 156, 0.08)",
                  border: "1px solid rgba(0, 255, 156, 0.3)",
                  padding: "8px 14px",
                  borderRadius: "4px",
                  color: "var(--mint)",
                  fontFamily: "var(--font-ui)",
                  fontSize: "11px",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                ◈ Multiverse Terminal
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
                  onMouseEnter={() => soundEngine.playHover()}
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
                ↺ Replay The Void
              </button>
            </div>
          </nav>

          <div>
            <div className={styles.colHead}>Multiverse Intel</div>
            {!subscribed ? (
              <form onSubmit={handleSubscribe} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <span style={{ fontSize: "11px", color: "rgba(214, 236, 226, 0.6)" }}>
                  Receive confidential premiere drops &amp; footage unlocks.
                </span>
                <div style={{ display: "flex", gap: "4px" }}>
                  <input
                    type="email"
                    required
                    placeholder="agent@avengers.org"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    style={{
                      background: "rgba(3, 14, 10, 0.8)",
                      border: "1px solid rgba(0, 255, 156, 0.25)",
                      borderRadius: "4px",
                      padding: "6px 10px",
                      color: "#fff",
                      fontSize: "11px",
                      fontFamily: "var(--font-ui)",
                      outline: "none",
                      width: "160px",
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      background: "var(--green)",
                      border: "none",
                      borderRadius: "4px",
                      color: "#000",
                      fontWeight: 700,
                      fontSize: "10px",
                      padding: "6px 10px",
                      cursor: "pointer",
                    }}
                  >
                    Join
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ fontSize: "11px", color: "var(--green)", padding: "6px 0" }}>
                ✓ Transmission confirmed. Standby for dispatch.
              </div>
            )}
            <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setShortcutsOpen(true);
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--silver)",
                  fontSize: "11px",
                  cursor: "pointer",
                  padding: 0,
                  textAlign: "left",
                }}
              >
                ⌨ Keyboard Controls (?)
              </button>
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
            . All rights reserved. Fan concept, not affiliated with Marvel Studios.
          </span>
          <span>
            Crafted with Next.js, Three.js &amp; Web Audio by{" "}
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

