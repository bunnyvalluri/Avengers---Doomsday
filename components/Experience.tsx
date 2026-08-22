"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useLenis } from "@/lib/useLenis";
import { useExperience } from "@/lib/store";
import { signals } from "@/lib/signals";
import { getVideoEl, scrubEl } from "@/lib/videos";
import { soundEngine } from "@/lib/soundEngine";
import { VIDEO, SCROLL, TIMELINE_UNITS, CHARACTER_DETAILS } from "@/lib/constants";

import CinematicCanvas from "@/components/webgl/CinematicCanvas";
import VideoLayer from "@/components/overlays/VideoLayer";
import CharacterOrbit from "@/components/overlays/CharacterOrbit";
import StoryStack from "@/components/overlays/StoryStack";
import HorizontalReel from "@/components/overlays/HorizontalReel";
import TimelineImage from "@/components/overlays/TimelineImage";
import TitleReveal from "@/components/overlays/TitleReveal";
import FlashOverlay from "@/components/overlays/FlashOverlay";
import CinematicText from "@/components/overlays/CinematicText";
import ScrollCue from "@/components/ui/ScrollCue";
import SiteHeader from "@/components/ui/SiteHeader";
import HeroOverlay from "@/components/ui/HeroOverlay";
import SiteFooter from "@/components/ui/SiteFooter";
import ChapterNav from "@/components/ui/ChapterNav";
import AudioControl from "@/components/ui/AudioControl";
import TicketModal from "@/components/ui/TicketModal";
import CharacterDossierModal from "@/components/ui/CharacterDossierModal";
import MultiverseTerminal from "@/components/ui/MultiverseTerminal";
import ShortcutsModal from "@/components/ui/ShortcutsModal";
import CinematicTourHUD from "@/components/ui/CinematicTourHUD";
import ToastNotification from "@/components/ui/ToastNotification";
import CustomCursor from "@/components/ui/CustomCursor";
import { CHAPTERS_NAV } from "@/lib/constants";

// Master timeline positions (arbitrary units; ScrollTrigger scrubs scroll→time).
const T = {
  introEnd: 1.4,
  marvelEnd: 3.8,
  portalStart: 3.9,
  heroEnter: 4.7, // Section 2 begins — website chrome enters
  textStart: 5.2, // Section 2a — cinematic text sequence
  textEnd: 7.8,
  videoStart: 7.8, // Hero — Doom video appears fullscreen + scrubs
  videoEnd: 11.2,
  showcaseStart: 11.8, // Section 2 rises from the bottom (overlaps the hero end)
  showcaseEnd: 16.5, // the 6-card orbit completes
  storyStart: 16.8, // Section 3 (story stack) begins; Section 2 sinks
  storyEnd: 23.4, // Panel 6 fully revealed (then holds until the reel takes over)
  reelStart: 24.5, // Section 4 — horizontal cinematic timeline begins
  reelEnd: 31.3, // the strip finishes its right→left travel
  finaleStart: 30.9, // Section 5 — the battle fades in as the reel exits (overlap)
  finaleFadeEnd: 31.7, // opacity reaches 1
  finaleScrubStart: 31.7, // the battle video begins scrubbing frame-by-frame
  finaleScrubEnd: 38.4, // Cap frame; then the battle fades into the timeline artwork
  mcuStart: 38.7, // Section 6 — the MCU timeline image pans vertically
  mcuEnd: 44.3,
  titleStart: 44.0, // Section 7 — AVENGERS DOOMSDAY title reveal fades in (overlap)
  titleFadeEnd: 44.9,
  footerStart: 47.6, // the minimal footer rises at the very end
  total: TIMELINE_UNITS,
};

export default function Experience() {
  const [mounted, setMounted] = useState(false);
  useLenis();
  const trackRef = useRef<HTMLDivElement>(null);
  const builtRef = useRef(false);
  const lastScrollPos = useRef(0);
  const lastScrollTime = useRef(Date.now());

  useEffect(() => setMounted(true), []);

  // ── pointer tracking + video decoder priming + keyboard navigation ─────────
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      signals.mtx = (e.clientX / window.innerWidth) * 2 - 1;
      signals.mty = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let started = false;
    const onGesture = () => {
      if (started) return;
      started = true;
      useExperience.getState().start();
    };
    const evs = ["pointerdown", "keydown", "touchstart", "wheel", "scroll"] as const;
    evs.forEach((e) => window.addEventListener(e, onGesture, { passive: true }));

    const rm = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (rm?.matches) useExperience.getState().setReduceMotion(true);

    const onKeyNav = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;

      const state = useExperience.getState();

      // Space: Toggle Cinema Mode Auto-Tour
      if (e.code === "Space") {
        e.preventDefault();
        const next = !state.cinemaTourActive;
        state.setCinemaTourActive(next);
        soundEngine.playClick();
        state.showToast(next ? "Cinema Auto-Tour Activated" : "Cinema Auto-Tour Paused", "info");
        return;
      }

      // T: Open VIP Ticket Modal
      if (e.code === "KeyT") {
        e.preventDefault();
        soundEngine.playClick();
        state.setTicketModalOpen(!state.ticketModalOpen);
        return;
      }

      // M: Toggle Audio
      if (e.code === "KeyM") {
        e.preventDefault();
        const next = !state.audioEnabled;
        state.setAudioEnabled(next);
        soundEngine.setMute(!next);
        if (next) soundEngine.playSuccess();
        state.showToast(next ? "Audio Synth Online" : "Audio Muted", "info");
        return;
      }

      // D: Open Character Dossier
      if (e.code === "KeyD") {
        e.preventDefault();
        soundEngine.playClick();
        state.setSelectedCharacter(state.selectedCharacter ? null : CHARACTER_DETAILS[0]);
        return;
      }

      // ~ / ` : Open Multiverse Terminal
      if (e.code === "Backquote") {
        e.preventDefault();
        soundEngine.playDecryption();
        state.setDossierTerminalOpen(!state.dossierTerminalOpen);
        return;
      }

      // ? / / : Open Shortcuts Cheat Sheet
      if (e.key === "?" || (e.key === "/" && e.shiftKey)) {
        e.preventDefault();
        soundEngine.playClick();
        state.setShortcutsModalOpen(!state.shortcutsModalOpen);
        return;
      }

      // F: Toggle Fullscreen
      if (e.code === "KeyF") {
        e.preventDefault();
        soundEngine.playClick();
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
          state.showToast("Fullscreen Mode Enabled", "info");
        } else {
          document.exitFullscreen().catch(() => {});
        }
        return;
      }

      // R: Rewind to Start
      if (e.code === "KeyR") {
        e.preventDefault();
        soundEngine.playTeleport();
        const lenis = (window as unknown as { __lenis?: { scrollTo: (y: number, opts: { duration: number }) => void } }).__lenis;
        if (lenis) lenis.scrollTo(0, { duration: 1.2 });
        else window.scrollTo({ top: 0, behavior: "smooth" });
        state.showToast("Rewound to Chapter 01: The Void", "info");
        return;
      }

      // J / Down / PageDown: Next chapter
      if (e.key === "ArrowDown" || e.code === "KeyJ" || e.key === "PageDown") {
        const s = signals.scroll;
        const next = CHAPTERS_NAV.find((ch) => ch.progress > s + 0.03) ?? CHAPTERS_NAV[CHAPTERS_NAV.length - 1];
        if (next) {
          soundEngine.playTeleport();
          const totalY = (document.documentElement.scrollHeight - window.innerHeight) * next.progress;
          const lenis = (window as unknown as { __lenis?: { scrollTo: (y: number, opts: { duration: number }) => void } }).__lenis;
          if (lenis) lenis.scrollTo(totalY, { duration: 1.0 });
          else window.scrollTo({ top: totalY, behavior: "smooth" });
        }
      } else if (e.key === "ArrowUp" || e.code === "KeyK" || e.key === "PageUp") {
        const s = signals.scroll;
        const prev = [...CHAPTERS_NAV].reverse().find((ch) => ch.progress < s - 0.03) ?? CHAPTERS_NAV[0];
        if (prev) {
          soundEngine.playTeleport();
          const totalY = (document.documentElement.scrollHeight - window.innerHeight) * prev.progress;
          const lenis = (window as unknown as { __lenis?: { scrollTo: (y: number, opts: { duration: number }) => void } }).__lenis;
          if (lenis) lenis.scrollTo(totalY, { duration: 1.0 });
          else window.scrollTo({ top: totalY, behavior: "smooth" });
        }
      }
    };
    window.addEventListener("keydown", onKeyNav);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("keydown", onKeyNav);
      evs.forEach((e) => window.removeEventListener(e, onGesture));
    };
  }, []);

  // ── Cinema Mode Auto-Tour Loop ──────────────────────────────────
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const tourStep = (now: number) => {
      const state = useExperience.getState();
      if (state.cinemaTourActive) {
        const dt = (now - lastTime) / 1000;
        const scrollMax = document.documentElement.scrollHeight - window.innerHeight;
        if (scrollMax > 0) {
          // Normal speed: ~ 450 px / sec * cinemaSpeed
          const distance = 420 * state.cinemaSpeed * dt;
          const currentY = window.scrollY;
          const targetY = currentY + distance;

          if (targetY >= scrollMax) {
            state.setCinemaTourActive(false);
            state.showToast("Saga Tour Complete", "success");
          } else {
            window.scrollTo({ top: targetY, behavior: "auto" });
          }
        }
      }
      lastTime = now;
      animId = requestAnimationFrame(tourStep);
    };

    animId = requestAnimationFrame(tourStep);
    return () => cancelAnimationFrame(animId);
  }, []);

  // ── scroll-scrubbed master ──────────────────────────────────────
  useEffect(() => {
    if (!mounted || builtRef.current || !trackRef.current) return;
    builtRef.current = true;
    useExperience.getState().setPhase("intro");

    const heroThreshold = T.heroEnter / T.total;

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: trackRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.25,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          signals.scroll = self.progress;

          // Compute velocity for Web Audio synthesis modulation
          const now = Date.now();
          const dt = Math.max(1, now - lastScrollTime.current);
          const dy = Math.abs(self.progress - lastScrollPos.current);
          const velocity = (dy / dt) * 1000;
          lastScrollPos.current = self.progress;
          lastScrollTime.current = now;
          soundEngine.updateScrollSpeed(velocity);

          // Drive DOM video elements
          const marvel = getVideoEl("marvel");
          const hero = getVideoEl("hero");
          const finale = getVideoEl("finale");
          if (marvel) {
            marvel.style.opacity = signals.marvelOp.toFixed(3);
            if (signals.marvelOp > 0.002) scrubEl(marvel, signals.marvelT);
          }
          if (hero) {
            hero.style.opacity = signals.heroOp.toFixed(3);
            if (signals.heroOp > 0.002) scrubEl(hero, signals.heroT);
          }
          if (finale) {
            finale.style.opacity = signals.finale.toFixed(3);
            finale.style.visibility = signals.finale > 0.002 ? "visible" : "hidden";
            if (signals.finale > 0.002) scrubEl(finale, signals.finaleT);
          }
          const next = self.progress >= heroThreshold ? "hero" : "intro";
          if (useExperience.getState().phase !== next) useExperience.getState().setPhase(next);
        },
      },
    });

    // ── Section 1 · the void → the storm ─────────────────────────
    tl.to(signals, { energy: 1, duration: T.introEnd }, 0);
    tl.fromTo(signals, { marvelOp: 0 }, { marvelOp: 1, duration: 0.55 }, T.introEnd - 0.55);

    // ── Section 1 · Marvel intro scrubs ──────────────────────────
    tl.to(signals, { energy: 0.28, duration: 0.6 }, T.introEnd);
    tl.to(signals, { marvelT: VIDEO.marvelDur, duration: T.marvelEnd - T.introEnd }, T.introEnd);

    // ── continuous portal dive into the Hero ──
    tl.to(signals, { energy: 0.6, duration: 0.5 }, T.marvelEnd);
    tl.to(signals, { portal: 1, duration: 1.0, ease: "power1.in" }, T.portalStart);
    tl.to(signals, { dolly: 1, duration: 1.1 }, T.portalStart);
    tl.to(signals, { marvelOp: 0, duration: 0.2 }, T.heroEnter - 0.15);
    tl.to(signals, { header: 1, duration: 0.7 }, T.heroEnter + 0.05);
    tl.to(signals, { portal: 0, duration: 0.9, ease: "power1.out" }, T.heroEnter + 0.2);
    tl.to(signals, { dolly: 0, duration: 1.0 }, T.heroEnter + 0.2);

    // ── Section 2a · cinematic text sequence ──
    tl.to(signals, { energy: 0.12, duration: 0.8 }, T.heroEnter + 0.3);

    // ── Section 2b · Doom video appears ──
    tl.to(signals, { heroOp: 1, duration: 0.3, ease: "power2.out" }, T.videoStart);
    tl.to(signals, { energy: 0.15, duration: 0.6 }, T.videoStart);
    tl.to(signals, { heroT: VIDEO.heroDur, duration: T.videoEnd - T.videoStart }, T.videoStart);
    tl.to(signals, { energy: 0.13, duration: 0.8 }, T.videoEnd);

    // ── Section 2 (character showcase) ──
    tl.to(signals, { heroOp: 0, duration: 1.0, ease: "power2.in" }, T.showcaseStart);
    tl.to(signals, { showcase: 1, duration: T.showcaseEnd - T.showcaseStart, ease: "none" }, T.showcaseStart);
    tl.to(signals, { energy: 0.22, duration: 1.2, ease: "power1.out" }, T.showcaseStart);

    // ── Section 3 (cinematic story stack) ──
    tl.to(signals, { showcase: 0, duration: 0.9, ease: "power2.inOut" }, T.storyStart);
    tl.to(signals, { story: 1, duration: T.storyEnd - T.storyStart, ease: "none" }, T.storyStart);
    tl.to(signals, { energy: 0.18, duration: 1.0, ease: "power1.inOut" }, T.storyStart);

    // ── Section 4 (horizontal cinematic timeline) ──
    tl.to(signals, { reel: 1, duration: T.reelEnd - T.reelStart, ease: "none" }, T.reelStart);
    tl.to(signals, { energy: 0.19, duration: 1.4, ease: "power1.out" }, T.reelStart);

    // ── Section 5 (battle video) ──
    tl.to(signals, { finale: 1, duration: T.finaleFadeEnd - T.finaleStart, ease: "power2.out" }, T.finaleStart);
    tl.to(signals, { energy: 0.15, duration: 1.6, ease: "power1.inOut" }, T.finaleStart);
    tl.to(signals, { finaleT: VIDEO.finaleDur, duration: T.finaleScrubEnd - T.finaleScrubStart, ease: "none" }, T.finaleScrubStart);
    tl.to(signals, { finale: 0, duration: 0.9, ease: "power2.inOut" }, T.mcuStart - 0.2);

    // ── Section 6 (MCU timeline artwork) ──
    tl.to(signals, { mcu: 1, duration: T.mcuEnd - T.mcuStart, ease: "none" }, T.mcuStart);
    tl.to(signals, { energy: 0.13, duration: 1.4, ease: "power1.inOut" }, T.mcuStart);

    // ── Section 7 (title reveal) ──
    tl.to(signals, { title: 1, duration: T.titleFadeEnd - T.titleStart, ease: "power2.out" }, T.titleStart);
    tl.to(signals, { energy: 0.17, duration: 1.2, ease: "power1.inOut" }, T.titleStart);

    // ── Footer ──
    tl.to(signals, { footer: 1, duration: T.total - T.footerStart, ease: "power2.out" }, T.footerStart);

    if (process.env.NODE_ENV !== "production") {
      (window as unknown as Record<string, unknown>).__doom = { signals, tl, store: useExperience };
    }

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
      builtRef.current = false;
    };
  }, [mounted]);

  const marvelVh = SCROLL.introAtmos + SCROLL.marvelScrub + SCROLL.transition;
  const heroVh = SCROLL.heroText + SCROLL.heroScrub + SCROLL.heroOutro;
  const showcaseVh = SCROLL.showcaseRise + SCROLL.showcaseOrbit + SCROLL.showcaseOut;
  const storyVh = SCROLL.storyStack;
  const reelVh = SCROLL.reelStrip;
  const finaleVh = SCROLL.finaleScrub;
  const mcuVh = SCROLL.mcuPan;
  const titleVh = SCROLL.titleHold;
  const footerVh = SCROLL.footerReveal;

  return (
    <>
      <CustomCursor />

      <div className="stage">
        {/* real fullscreen <video> trailers (z-index 1) */}
        <VideoLayer />
        {/* Section 3 — six stacked story panels (z-index 2) */}
        <StoryStack />
        {/* Section 4 — horizontal cinematic timeline (z-index 2) */}
        <HorizontalReel />
        {/* Section 5 — the battle is a scroll-scrubbed <video> in VideoLayer (z1) */}
        {/* Section 6 — the MCU timeline artwork pans vertically (z-index 2) */}
        <TimelineImage />
        {/* Section 7 — the AVENGERS DOOMSDAY title reveal, autoplay/loop (z-index 2) */}
        <TitleReveal />
        {/* Section 2 — character video cards */}
        <CharacterOrbit />
        {/* transparent green atmosphere on top (z-index 3) */}
        {mounted && <CinematicCanvas />}
        <FlashOverlay />
        <CinematicText />
      </div>

      <SiteHeader />
      <HeroOverlay />
      <SiteFooter />
      <ScrollCue />
      <ChapterNav />
      <AudioControl />
      <TicketModal />
      <CharacterDossierModal />
      <MultiverseTerminal />
      <ShortcutsModal />
      <CinematicTourHUD />
      <ToastNotification />

      {/* invisible scroll track — the distance the scrub travels over */}
      <div className="scroll-track" ref={trackRef} aria-hidden>
        <section style={{ height: `${marvelVh}vh` }} aria-label="Marvel Intro" />
        <section style={{ height: `${heroVh}vh` }} aria-label="Hero" />
        <section style={{ height: `${showcaseVh}vh` }} aria-label="Characters" />
        <section style={{ height: `${storyVh}vh` }} aria-label="Story" />
        <section style={{ height: `${reelVh}vh` }} aria-label="Timeline" />
        <section style={{ height: `${finaleVh}vh` }} aria-label="Finale" />
        <section style={{ height: `${mcuVh}vh` }} aria-label="Saga" />
        <section style={{ height: `${titleVh}vh` }} aria-label="Title" />
        <section style={{ height: `${footerVh}vh` }} aria-label="Footer" />
      </div>
    </>
  );
}

