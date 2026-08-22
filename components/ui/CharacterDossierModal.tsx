"use client";

import { useEffect, useRef } from "react";
import { useExperience } from "@/lib/store";
import { soundEngine } from "@/lib/soundEngine";
import { CHARACTER_DETAILS, CharacterDetail } from "@/lib/constants";
import styles from "./dossier.module.css";

export default function CharacterDossierModal() {
  const selectedCharacter = useExperience((s) => s.selectedCharacter);
  const setSelectedCharacter = useExperience((s) => s.setSelectedCharacter);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedCharacter) {
        setSelectedCharacter(null);
        soundEngine.playClick();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedCharacter, setSelectedCharacter]);

  useEffect(() => {
    if (selectedCharacter && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [selectedCharacter]);

  if (!selectedCharacter) return null;

  const close = () => {
    soundEngine.playClick();
    setSelectedCharacter(null);
  };

  const switchChar = (char: CharacterDetail) => {
    soundEngine.playClick();
    setSelectedCharacter(char);
  };

  const powers = [
    { label: "Intelligence", val: selectedCharacter.powers.intelligence },
    { label: "Strength", val: selectedCharacter.powers.strength },
    { label: "Speed / Agility", val: selectedCharacter.powers.speed },
    { label: "Durability", val: selectedCharacter.powers.durability },
    { label: "Energy Projection", val: selectedCharacter.powers.energyProjection },
    { label: "Combat Mastery", val: selectedCharacter.powers.combatSkill },
  ];

  return (
    <div className={styles.backdrop} onClick={close} aria-modal="true" role="dialog">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={close} aria-label="Close dossier">
          ✕
        </button>

        <div className={styles.header}>
          <div>
            <div className={styles.kicker}>
              <span className={styles.kickerDot} />
              Latverian Intelligence Archive · S.H.I.E.L.D. Classified
            </div>
            <h2 className={styles.title}>{selectedCharacter.name}</h2>
            <div className={styles.alias}>{selectedCharacter.alias}</div>
          </div>
          <div className={styles.threatBadge}>
            Threat: {selectedCharacter.threatLevel}
          </div>
        </div>

        <div className={styles.bodyGrid}>
          <div className={styles.leftCol}>
            <div className={styles.videoBox}>
              <video
                ref={videoRef}
                className={styles.video}
                src={`/videos/char-${selectedCharacter.slug}.mp4`}
                poster={`/videos/char-${selectedCharacter.slug}-poster.jpg`}
                muted
                loop
                playsInline
                autoPlay
              />
              <div className={styles.videoOverlay} />
            </div>

            <div className={styles.quoteBox}>
              &ldquo;{selectedCharacter.quote}&rdquo;
              <span className={styles.quoteSpeaker}>— {selectedCharacter.name}</span>
            </div>

            <div>
              <div className={styles.sectionHeader}>Tactical Biography</div>
              <p className={styles.loreText}>{selectedCharacter.lore}</p>
            </div>
          </div>

          <div className={styles.leftCol}>
            <div>
              <div className={styles.sectionHeader}>Operative Metadata</div>
              <div className={styles.metaGrid}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Portrayed By</span>
                  <span className={styles.metaVal}>{selectedCharacter.actor}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Origin Realm</span>
                  <span className={styles.metaVal}>{selectedCharacter.origin}</span>
                </div>
              </div>
            </div>

            <div>
              <div className={styles.sectionHeader}>Power &amp; Threat Matrix</div>
              <div className={styles.powersList}>
                {powers.map((p, idx) => (
                  <div key={idx} className={styles.powerRow}>
                    <div className={styles.powerHeader}>
                      <span className={styles.powerLabel}>{p.label}</span>
                      <span className={styles.powerNum}>{p.val} / 100</span>
                    </div>
                    <div className={styles.powerBarTrack}>
                      <div className={styles.powerBarFill} style={{ width: `${p.val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className={styles.sectionHeader}>Signature Arsenals &amp; Tech</div>
              <div className={styles.tagsWrap}>
                {selectedCharacter.signatureWeapons.map((w, idx) => (
                  <span key={idx} className={styles.tagPill}>
                    {w}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className={styles.sectionHeader}>Key Factions &amp; Loyalties</div>
              <div className={styles.tagsWrap}>
                {selectedCharacter.affiliations.map((a, idx) => (
                  <span key={idx} className={styles.tagPill}>
                    {a}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.characterNavRow}>
          {CHARACTER_DETAILS.map((c) => (
            <button
              key={c.slug}
              type="button"
              className={`${styles.charTab} ${selectedCharacter.slug === c.slug ? styles.charTabActive : ""}`}
              onClick={() => switchChar(c)}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
