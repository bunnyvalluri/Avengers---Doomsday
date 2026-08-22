import { create } from "zustand";
import type { Phase, CharacterDetail } from "./constants";

export interface ToastData {
  id: string;
  message: string;
  type?: "info" | "success" | "warning";
}

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
  volume: number;
  activeChapter: number;
  
  // UX additions
  cinemaTourActive: boolean;
  cinemaSpeed: number; // 1 = normal, 1.5, 2
  selectedCharacter: CharacterDetail | null;
  dossierTerminalOpen: boolean;
  shortcutsModalOpen: boolean;
  selectedSeats: string[];
  toast: ToastData | null;

  setPhase: (p: Phase) => void;
  setReady: (v: boolean) => void;
  start: () => void;
  setReduceMotion: (v: boolean) => void;
  setTicketModalOpen: (open: boolean) => void;
  setAudioEnabled: (enabled: boolean) => void;
  setVolume: (v: number) => void;
  setActiveChapter: (chapter: number) => void;

  setCinemaTourActive: (active: boolean) => void;
  setCinemaSpeed: (speed: number) => void;
  setSelectedCharacter: (char: CharacterDetail | null) => void;
  setDossierTerminalOpen: (open: boolean) => void;
  setShortcutsModalOpen: (open: boolean) => void;
  setSelectedSeats: (seats: string[]) => void;
  toggleSeat: (seatId: string) => void;
  showToast: (message: string, type?: "info" | "success" | "warning") => void;
  clearToast: () => void;
}

export const useExperience = create<ExperienceState>((set, get) => ({
  phase: "loading",
  ready: false,
  started: false,
  reduceMotion: false,
  ticketModalOpen: false,
  audioEnabled: false,
  volume: 0.7,
  activeChapter: 0,

  cinemaTourActive: false,
  cinemaSpeed: 1,
  selectedCharacter: null,
  dossierTerminalOpen: false,
  shortcutsModalOpen: false,
  selectedSeats: ["D5", "D6"],
  toast: null,

  setPhase: (phase) => set({ phase }),
  setReady: (ready) => set({ ready }),
  start: () => set({ started: true }),
  setReduceMotion: (reduceMotion) => set({ reduceMotion }),
  setTicketModalOpen: (ticketModalOpen) => set({ ticketModalOpen }),
  setAudioEnabled: (audioEnabled) => set({ audioEnabled }),
  setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
  setActiveChapter: (activeChapter) => set({ activeChapter }),

  setCinemaTourActive: (cinemaTourActive) => set({ cinemaTourActive }),
  setCinemaSpeed: (cinemaSpeed) => set({ cinemaSpeed }),
  setSelectedCharacter: (selectedCharacter) => set({ selectedCharacter }),
  setDossierTerminalOpen: (dossierTerminalOpen) => set({ dossierTerminalOpen }),
  setShortcutsModalOpen: (shortcutsModalOpen) => set({ shortcutsModalOpen }),
  setSelectedSeats: (selectedSeats) => set({ selectedSeats }),
  toggleSeat: (seatId: string) => {
    const current = get().selectedSeats;
    if (current.includes(seatId)) {
      set({ selectedSeats: current.filter((s) => s !== seatId) });
    } else {
      if (current.length >= 6) {
        get().showToast("Maximum 6 VIP seats per reservation", "warning");
        return;
      }
      set({ selectedSeats: [...current, seatId] });
    }
  },
  showToast: (message, type = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    set({ toast: { id, message, type } });
  },
  clearToast: () => set({ toast: null }),
}));

export const experience = useExperience;

