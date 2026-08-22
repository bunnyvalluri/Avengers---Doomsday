"use client";

import { useEffect, useState } from "react";
import { useExperience } from "@/lib/store";
import { soundEngine } from "@/lib/soundEngine";
import styles from "./terminal.module.css";

interface LogSection {
  id: string;
  title: string;
  time: string;
  body: string;
  alert?: string;
}

const LOGS: LogSection[] = [
  {
    id: "incursion",
    title: "CLASSIFIED REPORT: MULTIVERSAL INCURSION TIMELINE",
    time: "TIMESTAMP: 2026.05.08 // TVA REGISTRY 8472-OMEGA",
    body: `Universal decay accelerates across Earth-616, Earth-838, and Earth-10005. 
Initial collision vector localized at coordinates [RA 04h 35m / Dec +16° 30']. 
Temporal loom stabilization metrics dropped to 0.04%. 
Observation: Timelines are not collapsing randomly — they are being forcefully anchored towards Latverian Prime.`,
    alert: "CRITICAL: Loom fracture unavoidable without god-tier quantum manipulation.",
  },
  {
    id: "doom",
    title: "OPERATIVE PROFILE: DR. VICTOR VON DOOM",
    time: "TIMESTAMP: LATVERIA DEFENSE GRID // ACCESS GRANTED",
    body: `Subject has successfully combined the Scarlet Witch's Darkhold resonance, TVA temporal technology, and Vibranium quantum micro-capacitors.
Direct quote intercepted from Doom's Citadel:
"The Avengers were children playing with stones they could never comprehend. I am not destroying the multiverse; I am the only architect capable of building what remains."`,
    alert: "Direct engagement by standard Avengers strike teams discouraged.",
  },
  {
    id: "battleworld",
    title: "CONTINGENCY BLUEPRINT: PROJECT BATTLEWORLD",
    time: "TIMESTAMP: ARCHIVE 001-ALPHA // DOOM PROTOCOL",
    body: `Phase I: Isolate surviving universal fragments (Earth-616, Fox-Verse Mutant Realm, Talokan Aquatic Dominion).
Phase II: Erect Chronos Shields around Battleworld perimeter.
Phase III: Re-forge the Council of Dooms to govern all remaining cosmic domains.
Conclusion: Resistance from surviving Avengers (Thor, Captain America, Black Panther) anticipated.`,
  },
];

export default function MultiverseTerminal() {
  const open = useExperience((s) => s.dossierTerminalOpen);
  const setOpen = useExperience((s) => s.setDossierTerminalOpen);
  const [activeLog, setActiveLog] = useState(0);

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

  useEffect(() => {
    if (open) {
      soundEngine.playDecryption();
    }
  }, [open]);

  if (!open) return null;

  const log = LOGS[activeLog];

  return (
    <div className={styles.backdrop} onClick={() => setOpen(false)} aria-modal="true" role="dialog">
      <div className={styles.terminal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.scanlines} />

        <div className={styles.topBar}>
          <div className={styles.topBarTitle}>
            <span className={styles.statusDot} />
            <span>LATVERIAN PRIME // TVA TEMPORAL ARCHIVE TERMINAL</span>
          </div>
          <button
            className={styles.closeBtn}
            onClick={() => {
              setOpen(false);
              soundEngine.playClick();
            }}
          >
            [ESC] CLOSE
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.logEntry}>
            <div className={styles.timestamp}>{log.time}</div>
            <div className={styles.logTitle}>{log.title}</div>
            <div className={styles.logBody}>{log.body}</div>

            {log.alert && <div className={styles.threatBox}>{log.alert}</div>}
          </div>
        </div>

        <div className={styles.footerControls}>
          {LOGS.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              className={styles.cmdBtn}
              onClick={() => {
                soundEngine.playDecryption();
                setActiveLog(idx);
              }}
              style={{
                borderColor: activeLog === idx ? "var(--green)" : undefined,
                background: activeLog === idx ? "rgba(0, 255, 156, 0.25)" : undefined,
              }}
            >
              {`0${idx + 1} // ${item.id.toUpperCase()}`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
