/**
 * AVENGERS: DOOMSDAY — global design + timing constants.
 *
 * The experience is entirely SCROLL-DRIVEN. Nothing auto-plays: scroll position
 * scrubs both trailers frame-by-frame and drives every cinematic event through
 * a single scrubbed GSAP/ScrollTrigger master. Tuning lives here.
 */

/** Cinematic palette — pure black voids, toxic Doom greens, metallic highlights. */
export const COLORS = {
  black: "#000000",
  graphite: "#07090b",
  ink: "#04140f",
  green: "#00ff9c",
  greenDeep: "#00b473",
  greenDark: "#083b2a",
  emerald: "#12855b",
  mint: "#9dffd6",
  core: "#e6fff4",
  white: "#eafff6",
  silver: "#aebbb5",
} as const;

export const HEX = {
  green: 0x00ff9c,
  greenDeep: 0x00b473,
  greenDark: 0x083b2a,
  emerald: 0x12855b,
  mint: 0x9dffd6,
  core: 0xe6fff4,
} as const;

/** Asset locations (served from /public). Videos are all-intra for scrubbing. */
export const ASSETS = {
  marvelVideo: "/videos/marvel-intro-seq.mp4",
  marvelPoster: "/videos/marvel-intro-poster.jpg",
  // New user-uploaded Hero trailer (landscape ~2.39:1) — fills with object-fit:cover.
  heroVideo: "/videos/hero-seq-v2.mp4",
  heroPoster: "/videos/hero-poster-v2.jpg",
  // Section 5 ending (Thor → Doom → Captain America) — scroll-scrubbed, all-intra.
  // Swap this one file to update the ending; nothing else needs to change.
  finaleVideo: "/videos/finale-seq.mp4",
  finalePoster: "/videos/finale-poster.jpg",
  // Section 6 — the MCU timeline artwork (tall; scroll-panned).
  timelineImg: "/story/timeline.jpg",
  // Section 7 — the AVENGERS DOOMSDAY title reveal (autoplay + loop).
  titleVideo: "/videos/title-reveal.mp4",
  titlePoster: "/videos/title-reveal-poster.jpg",
} as const;

/** Approx durations (s); refined from real metadata at runtime. */
export const VIDEO = {
  marvelDur: 5.35,
  heroDur: 10.67,
  finaleDur: 23.9,
} as const;

/**
 * Scroll section heights (in vh) — the total scroll distance the scrub spans.
 * Bigger = more scroll per second of footage = a more deliberate, frame-by-
 * frame feel.
 */
export const SCROLL = {
  introAtmos: 60, // Section 1 — the void + storm builds
  marvelScrub: 110, // Section 1 — Marvel intro scrubs
  transition: 60, // continuous portal dive into the Hero
  heroText: 110, // Hero — cinematic text sequence (video hidden)
  heroScrub: 140, // Hero — Doom video appears fullscreen + scrubs
  heroOutro: 40, // Hero settle
  // ── Phase 2 · Section 2 (character showcase) ──
  showcaseRise: 70, // Hero fades / Section 2 rises from the bottom, model appears
  showcaseOrbit: 160, // the 6 cards orbit the model, active card cycles to front
  showcaseOut: 35, // settle
  // ── Phase 3 · Section 3 (cinematic story stack) ──
  storyStack: 260, // 6 fullscreen panels rise + stack sequentially (pinned)
  // ── Phase 4 · Section 4 (horizontal cinematic timeline) ──
  reelStrip: 260, // pinned; vertical scroll drives the strip right→left
  // ── Phase 5 · Section 5 (scroll-scrubbed battle: Thor → Doom → Cap) ──
  finaleScrub: 280, // the battle video scrubs frame-by-frame with scroll
  // ── Ending · Section 6 (MCU timeline artwork) + 7 (title reveal) + footer ──
  mcuPan: 220, // the tall MCU timeline pans vertically with scroll
  titleHold: 120, // the AVENGERS DOOMSDAY title reveal autoplays/holds
  footerReveal: 65, // the minimal footer rises at the very end
} as const;

/**
 * Total scroll distance (vh) and the equivalent master-timeline length in units
 * (100vh = 1 unit). Derived from SCROLL so the two never drift — the timeline's
 * total AND the scroll→time mapping both come from here, which keeps every
 * scroll-positioned cue (e.g. the cinematic text beats) locked to its moment
 * even as sections are added.
 */
export const SCROLL_VH_TOTAL = Object.values(SCROLL).reduce((a, b) => a + b, 0);
export const TIMELINE_UNITS = SCROLL_VH_TOTAL / 100;

export interface ChapterInfo {
  id: string;
  name: string;
  short: string;
  progress: number;
}

export const CHAPTERS_NAV: ChapterInfo[] = [
  { id: "intro", name: "01 · The Void", short: "Void", progress: 0.0 },
  { id: "hero", name: "02 · Doom Arrival", short: "Hero", progress: (SCROLL.introAtmos + SCROLL.marvelScrub + SCROLL.transition) / SCROLL_VH_TOTAL },
  { id: "showcase", name: "03 · Character Orbit", short: "Orbit", progress: (SCROLL.introAtmos + SCROLL.marvelScrub + SCROLL.transition + SCROLL.heroText + SCROLL.heroScrub + SCROLL.heroOutro) / SCROLL_VH_TOTAL },
  { id: "story", name: "04 · Story Chapters", short: "Story", progress: (SCROLL.introAtmos + SCROLL.marvelScrub + SCROLL.transition + SCROLL.heroText + SCROLL.heroScrub + SCROLL.heroOutro + SCROLL.showcaseRise + SCROLL.showcaseOrbit + SCROLL.showcaseOut) / SCROLL_VH_TOTAL },
  { id: "timeline", name: "05 · Timeline Reel", short: "Reel", progress: (SCROLL.introAtmos + SCROLL.marvelScrub + SCROLL.transition + SCROLL.heroText + SCROLL.heroScrub + SCROLL.heroOutro + SCROLL.showcaseRise + SCROLL.showcaseOrbit + SCROLL.showcaseOut + SCROLL.storyStack) / SCROLL_VH_TOTAL },
  { id: "finale", name: "06 · Battle Finale", short: "Battle", progress: (SCROLL.introAtmos + SCROLL.marvelScrub + SCROLL.transition + SCROLL.heroText + SCROLL.heroScrub + SCROLL.heroOutro + SCROLL.showcaseRise + SCROLL.showcaseOrbit + SCROLL.showcaseOut + SCROLL.storyStack + SCROLL.reelStrip) / SCROLL_VH_TOTAL },
  { id: "mcu", name: "07 · MCU Road", short: "Saga", progress: (SCROLL.introAtmos + SCROLL.marvelScrub + SCROLL.transition + SCROLL.heroText + SCROLL.heroScrub + SCROLL.heroOutro + SCROLL.showcaseRise + SCROLL.showcaseOrbit + SCROLL.showcaseOut + SCROLL.storyStack + SCROLL.reelStrip + SCROLL.finaleScrub) / SCROLL_VH_TOTAL },
  { id: "title", name: "08 · Title Reveal", short: "Title", progress: (SCROLL.introAtmos + SCROLL.marvelScrub + SCROLL.transition + SCROLL.heroText + SCROLL.heroScrub + SCROLL.heroOutro + SCROLL.showcaseRise + SCROLL.showcaseOrbit + SCROLL.showcaseOut + SCROLL.storyStack + SCROLL.reelStrip + SCROLL.finaleScrub + SCROLL.mcuPan) / SCROLL_VH_TOTAL },
];

export type Phase = "loading" | "intro" | "hero";

export interface CharacterDetail {
  slug: string;
  name: string;
  alias: string;
  actor: string;
  origin: string;
  threatLevel: "ALPHA" | "OMEGA" | "MULTIVERSAL" | "EXTREME";
  powers: {
    intelligence: number; // 0-100
    strength: number;
    speed: number;
    durability: number;
    energyProjection: number;
    combatSkill: number;
  };
  quote: string;
  desc: string;
  lore: string;
  affiliations: string[];
  signatureWeapons: string[];
  accentColor: string;
}

export const CHARACTER_DETAILS: CharacterDetail[] = [
  {
    slug: "doom",
    name: "Victor von Doom",
    alias: "Doctor Doom / Emperor Doom",
    actor: "Robert Downey Jr.",
    origin: "Latveria (Earth-616 Variant / Beyond)",
    threatLevel: "MULTIVERSAL",
    powers: {
      intelligence: 100,
      strength: 85,
      speed: 70,
      durability: 95,
      energyProjection: 98,
      combatSkill: 92,
    },
    quote: "There is only one will that can preserve existence. Mine.",
    desc: "The iron-willed sovereign of Latveria — master of science and sorcery, bending every reality to his design.",
    lore: "Equipped with titanium armor powered by dark cosmic fusion and mastery over Eldritch arts surpassing the Sorcerer Supreme, Doom has orchestrated the convergence of fragmented timelines to birth Battleworld.",
    affiliations: ["Latverian Sovereignty", "The Cabal", "Council of Dooms"],
    signatureWeapons: ["Arcane Power Armor", "Chronos Gauntlet", "Doombot Legion"],
    accentColor: "#00ff9c",
  },
  {
    slug: "blackpanther",
    name: "Shuri",
    alias: "Black Panther",
    actor: "Letitia Wright",
    origin: "Kingdom of Wakanda",
    threatLevel: "OMEGA",
    powers: {
      intelligence: 98,
      strength: 78,
      speed: 88,
      durability: 85,
      energyProjection: 75,
      combatSkill: 94,
    },
    quote: "Wakanda stands as the shield against the encroaching dark.",
    desc: "Wakanda's protector, striking with the speed, precision, and fury of the panther goddess.",
    lore: "Synthesizing synthetic Heart-Shaped Herb extracts with kinetic-absorbent Vibranium nanotech weave, Shuri leads Wakanda's defense grid as multiverse incursions threaten their borders.",
    affiliations: ["Avengers", "Wakandan Royal Council", "Midnight Angels"],
    signatureWeapons: ["Vibranium Nano-Claws", "Kinetic Energy Redistribution Suit", "Sonic Gauntlets"],
    accentColor: "#38ffb2",
  },
  {
    slug: "cyclops",
    name: "Scott Summers",
    alias: "Cyclops",
    actor: "James Marsden",
    origin: "Krakoa / Xavier's Institute",
    threatLevel: "OMEGA",
    powers: {
      intelligence: 85,
      strength: 65,
      speed: 68,
      durability: 70,
      energyProjection: 98,
      combatSkill: 96,
    },
    quote: "To me, my X-Men. Hold the line at all costs.",
    desc: "Field leader of the X-Men, unleashing devastating optic force with unshakable discipline and tactical genius.",
    lore: "Possessing eyes that act as dimensional apertures to a universe of non-Einsteinian concussive energy, Cyclops stands as the master field tactician capable of commanding interdimensional mutant forces.",
    affiliations: ["X-Men", "Krakoan Quiet Council", "Mutant Strike Force"],
    signatureWeapons: ["Ruby-Quartz Visor", "Tactical Combat Rig", "Optic Beam Focusers"],
    accentColor: "#00d884",
  },
  {
    slug: "mystique",
    name: "Raven Darkhölme",
    alias: "Mystique",
    actor: "Rebecca Romijn",
    origin: "Unknown",
    threatLevel: "ALPHA",
    powers: {
      intelligence: 88,
      strength: 60,
      speed: 75,
      durability: 72,
      energyProjection: 30,
      combatSkill: 95,
    },
    quote: "Perception is a weapon. And I command what you see.",
    desc: "The shape-shifting infiltrator who can wear any face — trusted by none, lethal in every form she takes.",
    lore: "With cellular metamorphism granting complete anatomical manipulation and cellular rejuvenation, Raven navigates the shadows of the collapsing multiverse playing both sides until the final hour.",
    affiliations: ["Brotherhood of Mutants", "Freedom Force", "Independent Operative"],
    signatureWeapons: ["Suppressed Tactical Pistols", "Biochemical Darts", "Disguise Matrix"],
    accentColor: "#9dffd6",
  },
  {
    slug: "gambit",
    name: "Remy LeBeau",
    alias: "Gambit",
    actor: "Channing Tatum",
    origin: "New Orleans, Louisiana",
    threatLevel: "OMEGA",
    powers: {
      intelligence: 78,
      strength: 65,
      speed: 84,
      durability: 70,
      energyProjection: 92,
      combatSkill: 93,
    },
    quote: "You know how long I been waitin' for this? Woo I'm about to make a name for myself.",
    desc: "The Ragin' Cajun — charging every card with explosive kinetic energy and every fight with reckless charm.",
    lore: "Drawing upon kinetic biocells, Gambit converts the potential energy of inanimate objects into explosive concussive kinetic force, weaving acrobatic martial arts with charged cards.",
    affiliations: ["X-Men", "Thieves Guild", "Marauders"],
    signatureWeapons: ["Charged Kinetic Playing Cards", "Collapsible Bo Staff", "Duster Armor"],
    accentColor: "#ff00ea",
  },
  {
    slug: "namor",
    name: "Namor McKenzie",
    alias: "The Sub-Mariner / K'uk'ulkan",
    actor: "Tenoch Huerta",
    origin: "Talokan",
    threatLevel: "EXTREME",
    powers: {
      intelligence: 84,
      strength: 96,
      speed: 90,
      durability: 95,
      energyProjection: 80,
      combatSkill: 92,
    },
    quote: "Imperius Rex! The surface world will not dictate the fate of the oceans.",
    desc: "The winged sovereign of Talokan — as ancient as the deep and as merciless as the tide he commands.",
    lore: "Mutant demigod endowed with ankle wings for sustained flight, superhuman aquatic physiology, and hydrokinetic vibranium spear mastery, Namor defends his aquatic realm against universal collapse.",
    affiliations: ["Talokan", "Illuminati", "Invaders"],
    signatureWeapons: ["Vibranium Sun Spear", "Talokanil Armor", "Winged Ankle Blades"],
    accentColor: "#00b473",
  },
];

export const FORMAT_OPTIONS = [
  {
    id: "imax",
    name: "IMAX 3D Laser",
    resolution: "4K Dual Laser Dual 1.43:1",
    audio: "12-Track Immersive Spatial Audio",
    screen: "70ft Custom Curved Giant Canvas",
    badge: "Director's Vision",
    desc: "Custom master filmed with IMAX certified digital cameras, delivering up to 26% more picture.",
  },
  {
    id: "dolby",
    name: "Dolby Cinema",
    resolution: "Dolby Vision 4K HDR 1,000,000:1",
    audio: "Dolby Atmos 128-Object Soundstage",
    screen: "Premium Matte Low-Reflect Screen",
    badge: "Deepest Blacks",
    desc: "Unmatched contrast ratio with moving audio that flows all around you in three-dimensional space.",
  },
  {
    id: "4dx",
    name: "4DX Extreme Motion",
    resolution: "Synchronized Real-D 3D",
    audio: "7.1 Pro Sound Matrix",
    screen: "Multi-Sensory Environmental Hall",
    badge: "Tactile Immersion",
    desc: "High-velocity motion chairs synchronized with wind, lightning, fog, water, and kinetic impact shocks.",
  },
  {
    id: "screenx",
    name: "ScreenX 270° Panoramic",
    resolution: "Triple-Projector 270-Degree Field",
    audio: "Acoustic Surround Array",
    screen: "Tri-Wall Extended Architecture",
    badge: "270° Vision",
    desc: "Expands selected action sequences across left and right auditorium walls for full visual wrap.",
  },
];

