"use client";

import { useRef, useState } from "react";
import { signals } from "@/lib/signals";
import { useRaf } from "@/lib/useRaf";
import { useExperience } from "@/lib/store";
import { CHAPTERS_NAV } from "@/lib/constants";
import { soundEngine } from "@/lib/soundEngine";
import styles from "./ui.module.css";

const NAV = [
  { name: "Overview", chapterIndex: 1 },
  { name: "Heroes", chapterIndex: 2 },
  { name: "Story", chapterIndex: 3 },
  { name: "Timeline", chapterIndex: 4 },
  { name: "Finale", chapterIndex: 5 },
];

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export default function SiteHeader() {
  const ref = useRef<HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const setTicketOpen = useExperience((s) => s.setTicketModalOpen);
  const cinemaTourActive = useExperience((s) => s.cinemaTourActive);
  const setCinemaTourActive = useExperience((s) => s.setCinemaTourActive);
  const setShortcutsOpen = useExperience((s) => s.setShortcutsModalOpen);
  const setTerminalOpen = useExperience((s) => s.setDossierTerminalOpen);
  const showToast = useExperience((s) => s.showToast);

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
    soundEngine.playTeleport();
    setMobileOpen(false);
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

  const toggleCinemaTour = () => {
    soundEngine.playClick();
    const next = !cinemaTourActive;
    setCinemaTourActive(next);
    showToast(next ? "Cinema Auto-Tour Activated (Space)" : "Cinema Auto-Tour Paused", "info");
  };

  const openShortcuts = () => {
    soundEngine.playClick();
    setShortcutsOpen(true);
  };

  const openTerminal = () => {
    soundEngine.playDecryption();
    setTerminalOpen(true);
    showToast("Decrypted Latverian Terminal (~)", "success");
  };

  const openTickets = () => {
    soundEngine.playClick();
    setTicketOpen(true);
  };

  return (
    <>
      <header ref={ref} className={styles.header} style={{ opacity: 0, visibility: "hidden" }}>
        <div
          className={styles.brand}
          onClick={() => jumpTo(0)}
          style={{ cursor: "pointer" }}
          title="Restart Saga (Void)"
        >
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
              onMouseEnter={() => soundEngine.playHover()}
            >
              {n.name}
            </button>
          ))}
        </nav>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={`${styles.headerIconBtn} ${cinemaTourActive ? styles.cinemaBtnActive : styles.cinemaBtn}`}
            onClick={toggleCinemaTour}
            title="Auto-Scroll Cinema Tour (Space)"
          >
            <span>{cinemaTourActive ? "❚❚" : "▶"}</span>
            <span>Cinema Mode</span>
          </button>

          <button
            type="button"
            className={styles.headerIconBtn}
            onClick={openTerminal}
            title="Classified Multiverse Terminal (~)"
          >
            <span>◈</span>
            <span>Terminal</span>
          </button>

          <button
            type="button"
            className={styles.headerIconBtn}
            onClick={openShortcuts}
            title="Keyboard Shortcuts (?)"
          >
            <span>⌨</span>
          </button>

          <button className={styles.cta} type="button" onClick={openTickets}>
            Get Tickets
          </button>

          <button
            type="button"
            className={styles.mobileMenuBtn}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div className={styles.mobileDrawer}>
          {CHAPTERS_NAV.map((ch, idx) => (
            <button
              key={ch.id}
              type="button"
              className={styles.mobileNavLink}
              onClick={() => jumpTo(idx)}
            >
              {ch.name}
            </button>
          ))}
          <div style={{ display: "flex", gap: "0.8rem", marginTop: "1rem" }}>
            <button type="button" className={styles.cta} style={{ flex: 1 }} onClick={openTickets}>
              Get VIP Tickets
            </button>
            <button
              type="button"
              className={styles.headerIconBtn}
              onClick={() => {
                setMobileOpen(false);
                toggleCinemaTour();
              }}
            >
              Cinema Tour
            </button>
          </div>
        </div>
      )}
    </>
  );
}

