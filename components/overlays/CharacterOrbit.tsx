import { useEffect, useRef } from "react";
import { signals } from "@/lib/signals";
import { useRaf } from "@/lib/useRaf";
import { useExperience } from "@/lib/store";
import { CHARACTER_DETAILS, CharacterDetail } from "@/lib/constants";
import { soundEngine } from "@/lib/soundEngine";
import styles from "./orbit.module.css";

const TAU = Math.PI * 2;
const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export default function CharacterOrbit() {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const setSelectedCharacter = useExperience((s) => s.setSelectedCharacter);

  // Guarantee muted inline playback so programmatic play() is never blocked
  useEffect(() => {
    videoRefs.current.forEach((v) => {
      if (!v) return;
      v.muted = true;
      v.defaultMuted = true;
      v.playsInline = true;
    });
  }, []);

  useRaf(() => {
    const s = signals.showcase;
    const t = signals.time;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    if (s <= 0.001 || s >= 0.999) {
      for (const v of videoRefs.current) {
        if (v && !v.paused) v.pause();
      }
      for (const card of cardRefs.current) {
        if (card && card.style.visibility !== "hidden") card.style.visibility = "hidden";
      }
      return;
    }

    const wantPlay = s > 0.01 && s < 0.98;
    const isMobile = vw < 768;
    const isTablet = vw >= 768 && vw < 1024;
    const Rx = isMobile ? vw * 0.35 : isTablet ? vw * 0.33 : vw * 0.3; // horizontal orbit radius
    const Ry = isMobile ? vh * 0.11 : isTablet ? vh * 0.13 : vh * 0.15; // vertical tilt
    const base = s * TAU * 0.85 + t * 0.045; // scroll rotates the ring + slow idle
    const N = CHARACTER_DETAILS.length;

    for (let i = 0; i < N; i++) {
      const card = cardRefs.current[i];
      if (!card) continue;

      // staggered fly-in from the right as the section rises
      const enterAt = 0.05 + i * 0.055;
      const enter = smoothstep(enterAt, enterAt + 0.16, s);
      const vid = videoRefs.current[i];

      if (enter <= 0.001) {
        if (card.style.visibility !== "hidden") card.style.visibility = "hidden";
        if (vid && !vid.paused) vid.pause();
        continue;
      }
      card.style.visibility = "visible";

      const theta = base + i * (TAU / N);
      const d = Math.cos(theta); // 1 = front, -1 = behind the model
      const depth01 = (d + 1) / 2; // 0 back .. 1 front

      if (vid) {
        if (wantPlay && depth01 > 0.18) {
          if (vid.paused) vid.play().catch(() => {});
        } else if (!vid.paused) {
          vid.pause();
        }
      }
      const x = Math.sin(theta) * Rx;
      const y = d * Ry;
      const scale = lerp(0.6, 1.06, depth01) * lerp(0.5, 1, enter);
      const rotY = -Math.sin(theta) * 12; // subtle turn
      const enterX = (1 - enter) * (vw * 0.55);

      card.style.transform =
        `translate(-50%, -50%) perspective(1100px) translate3d(${(x + enterX).toFixed(1)}px, ${y.toFixed(1)}px, 0)` +
        ` rotateY(${rotY.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
      card.style.opacity = (lerp(0.32, 1, depth01) * enter).toFixed(3);
      card.style.pointerEvents = d > 0.2 ? "auto" : "none";
      card.style.cursor = d > 0.2 ? "pointer" : "default";
      // straddle the atmosphere/model canvas (z3): front over, back behind
      card.style.zIndex = d > 0 ? "4" : "2";
      // depth blur on the far cards
      card.style.filter = d < -0.05 ? `blur(${(-d * 3).toFixed(2)}px)` : "none";
      // green glow strongest on the front-most card
      card.style.setProperty("--glow", smoothstep(0.55, 1, depth01).toFixed(3));
    }
  });

  const handleCardClick = (char: CharacterDetail) => {
    soundEngine.playClick();
    setSelectedCharacter(char);
  };

  return (
    <div className={styles.layer} aria-hidden={false}>
      {CHARACTER_DETAILS.map((c, i) => (
        <div
          key={c.slug}
          className={styles.card}
          ref={(el) => {
            cardRefs.current[i] = el;
          }}
          onClick={() => handleCardClick(c)}
          onMouseEnter={() => soundEngine.playHover()}
          style={{ visibility: "hidden" }}
          title={`Inspect Intelligence Dossier: ${c.name}`}
        >
          <video
            ref={(el) => {
              if (el) {
                el.muted = true;
                el.playsInline = true;
              }
              videoRefs.current[i] = el;
            }}
            className={styles.video}
            src={`/videos/char-${c.slug}.mp4`}
            poster={`/videos/char-${c.slug}-poster.jpg`}
            muted
            loop
            playsInline
            preload="auto"
            disablePictureInPicture
          />
          <div className={styles.grad} />
          <div className={styles.frame} />
          <div className={styles.tick}>
            <span className={styles.dot} />
            {`0${i + 1} · Dossier`}
          </div>
          <div className={styles.info}>
            <div className={styles.name}>{c.name}</div>
            <div className={styles.desc}>{c.desc}</div>
            <div
              style={{
                fontSize: "9px",
                letterSpacing: "0.2em",
                color: "var(--green)",
                textTransform: "uppercase",
                marginTop: "6px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span>◈ Inspect File</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

