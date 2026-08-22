"use client";

import { useEffect, useState } from "react";
import { useExperience } from "@/lib/store";
import { soundEngine } from "@/lib/soundEngine";
import styles from "./ui.module.css";

export default function AudioControl() {
  const audioEnabled = useExperience((s) => s.audioEnabled);
  const setAudioEnabled = useExperience((s) => s.setAudioEnabled);
  const showToast = useExperience((s) => s.showToast);
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(audioEnabled);
    soundEngine.setMute(!audioEnabled);
  }, [audioEnabled]);

  const toggleAudio = () => {
    const next = !active;
    setActive(next);
    setAudioEnabled(next);
    soundEngine.setMute(!next);
    if (next) {
      soundEngine.playSuccess();
      showToast("Multiverse Ambient Audio Synth Online (M)", "success");
    } else {
      showToast("Audio Muted", "info");
    }
  };

  return (
    <div className={`${styles.corner} ${styles.sound}`}>
      <button
        type="button"
        className={`${styles.btn} ${!active ? styles.muted : ""}`}
        onClick={toggleAudio}
        onMouseEnter={() => soundEngine.playHover()}
        aria-label={active ? "Mute ambient audio (M)" : "Enable cinematic sound (M)"}
        title={active ? "Sound: Online (Press M to Mute)" : "Sound: Muted (Press M to Enable)"}
      >
        <div className={styles.eq}>
          <span />
          <span />
          <span />
          <span />
        </div>
      </button>
    </div>
  );
}
