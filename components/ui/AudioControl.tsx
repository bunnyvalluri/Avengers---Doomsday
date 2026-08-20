"use client";

import { useEffect, useRef, useState } from "react";
import { useExperience } from "@/lib/store";
import styles from "./ui.module.css";

export default function AudioControl() {
  const audioEnabled = useExperience((s) => s.audioEnabled);
  const setAudioEnabled = useExperience((s) => s.setAudioEnabled);
  const [active, setActive] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const toggleAudio = () => {
    const next = !active;
    setActive(next);
    setAudioEnabled(next);

    try {
      if (next) {
        if (!audioCtxRef.current) {
          const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          if (AudioContextClass) {
            const ctx = new AudioContextClass();
            const osc = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            const gain = ctx.createGain();
            const filter = ctx.createBiquadFilter();

            osc.type = "sine";
            osc.frequency.setValueAtTime(55, ctx.currentTime); // Low A hum
            osc2.type = "triangle";
            osc2.frequency.setValueAtTime(110, ctx.currentTime); // Harmonic overtone

            filter.type = "lowpass";
            filter.frequency.setValueAtTime(220, ctx.currentTime);

            gain.gain.setValueAtTime(0.04, ctx.currentTime);

            osc.connect(filter);
            osc2.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc2.start();

            audioCtxRef.current = ctx;
            gainNodeRef.current = gain;
          }
        } else if (audioCtxRef.current.state === "suspended") {
          audioCtxRef.current.resume();
        }
        if (gainNodeRef.current && audioCtxRef.current) {
          gainNodeRef.current.gain.setTargetAtTime(0.04, audioCtxRef.current.currentTime, 0.5);
        }
      } else {
        if (gainNodeRef.current && audioCtxRef.current) {
          gainNodeRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.3);
        }
      }
    } catch {
      // AudioContext fallback
    }
  };

  useEffect(() => {
    return () => {
      audioCtxRef.current?.close().catch(() => {});
    };
  }, []);

  return (
    <div className={`${styles.corner} ${styles.sound}`}>
      <button
        type="button"
        className={`${styles.btn} ${!active ? styles.muted : ""}`}
        onClick={toggleAudio}
        aria-label={active ? "Mute ambient audio" : "Enable cinematic sound"}
        title={active ? "Sound: Active (Click to Mute)" : "Sound: Muted (Click to Enable)"}
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
