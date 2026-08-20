"use client";

import { create } from "zustand";
import type { Phase } from "./constants";

/**
 * Discrete experience state. Phase flips as the scroll crosses section
 * boundaries (intro → hero); the website chrome keys off it. Per-frame values
 * live in `signals.ts`.
 */
interface ExperienceState {
  phase: Phase;
  ready: boolean;
  started: boolean;
  reduceMotion: boolean;
  ticketModalOpen: boolean;
  audioEnabled: boolean;
  activeChapter: number;

  setPhase: (p: Phase) => void;
  setReady: (v: boolean) => void;
  start: () => void;
  setReduceMotion: (v: boolean) => void;
  setTicketModalOpen: (open: boolean) => void;
  setAudioEnabled: (enabled: boolean) => void;
  setActiveChapter: (chapter: number) => void;
}

export const useExperience = create<ExperienceState>((set) => ({
  phase: "loading",
  ready: false,
  started: false,
  reduceMotion: false,
  ticketModalOpen: false,
  audioEnabled: false,
  activeChapter: 0,

  setPhase: (phase) => set({ phase }),
  setReady: (ready) => set({ ready }),
  start: () => set({ started: true }),
  setReduceMotion: (reduceMotion) => set({ reduceMotion }),
  setTicketModalOpen: (ticketModalOpen) => set({ ticketModalOpen }),
  setAudioEnabled: (audioEnabled) => set({ audioEnabled }),
  setActiveChapter: (activeChapter) => set({ activeChapter }),
}));

export const experience = useExperience;
