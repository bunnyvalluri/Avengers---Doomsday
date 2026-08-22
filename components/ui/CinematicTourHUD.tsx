"use client";

import { useExperience } from "@/lib/store";
import { soundEngine } from "@/lib/soundEngine";
import { CHAPTERS_NAV } from "@/lib/constants";
import styles from "./ui.module.css";

export default function CinematicTourHUD() {
  const cinemaTourActive = useExperience((s) => s.cinemaTourActive);
  const setCinemaTourActive = useExperience((s) => s.setCinemaTourActive);
  const cinemaSpeed = useExperience((s) => s.cinemaSpeed);
  const setCinemaSpeed = useExperience((s) => s.setCinemaSpeed);
  const showToast = useExperience((s) => s.showToast);

  if (!cinemaTourActive) return null;

  const toggleSpeed = () => {
    soundEngine.playClick();
    const nextSpeed = cinemaSpeed === 1 ? 1.5 : cinemaSpeed === 1.5 ? 2 : 1;
    setCinemaSpeed(nextSpeed);
    showToast(`Cinema Tour Speed: ${nextSpeed}x`, "info");
  };

  const stopTour = () => {
    soundEngine.playClick();
    setCinemaTourActive(false);
    showToast("Cinema Tour Paused", "info");
  };

  const skipNext = () => {
    soundEngine.playTeleport();
    const s = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
    const next = CHAPTERS_NAV.find((ch) => ch.progress > s + 0.04) ?? CHAPTERS_NAV[0];
    const totalY = (document.documentElement.scrollHeight - window.innerHeight) * next.progress;
    const lenis = (window as unknown as { __lenis?: { scrollTo: (y: number, opts: { duration: number }) => void } }).__lenis;
    if (lenis) lenis.scrollTo(totalY, { duration: 1.0 });
    else window.scrollTo({ top: totalY, behavior: "smooth" });
    showToast(`Skipped to ${next.name}`, "info");
  };

  return (
    <div className={styles.tourHudWrap}>
      <div className={styles.tourHudCard}>
        <div className={styles.tourIndicator}>
          <span className={styles.tourPulse} />
          <span className={styles.tourTitle}>CINEMA AUTO-TOUR ACTIVE</span>
        </div>

        <div className={styles.tourControls}>
          <button
            type="button"
            className={styles.tourBtn}
            onClick={toggleSpeed}
            title="Toggle playback speed"
          >
            {cinemaSpeed}x
          </button>

          <button
            type="button"
            className={styles.tourBtn}
            onClick={skipNext}
            title="Skip to next chapter"
          >
            ⏭ Next
          </button>

          <button
            type="button"
            className={`${styles.tourBtn} ${styles.tourBtnStop}`}
            onClick={stopTour}
            title="Exit Cinema Mode (Space)"
          >
            ❚❚ Pause
          </button>
        </div>
      </div>
    </div>
  );
}
