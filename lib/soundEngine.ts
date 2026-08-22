/**
 * Procedural Web Audio Synthesis Engine
 * 
 * Provides dynamic cinematic sub-drone, reactive dimensional shimmers,
 * and sci-fi tactile feedback sound effects (hover, click, portal warp, decryption, success).
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private droneGain: GainNode | null = null;
  private osc1: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;
  private subOsc: OscillatorNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private lfo: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;
  private isInitialized = false;
  private isMuted = true;
  private volume = 0.7;

  private initContext() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    } catch {
      // Audio context unavailable
    }
  }

  public init() {
    if (this.isInitialized || typeof window === "undefined") return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      const t = this.ctx.currentTime;

      // Master drone gain
      this.droneGain = this.ctx.createGain();
      this.droneGain.gain.setValueAtTime(0, t);

      // Lowpass resonant filter for dark cosmic tone
      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = "lowpass";
      this.filter.frequency.setValueAtTime(140, t);
      this.filter.Q.setValueAtTime(4.0, t);

      // Sub oscillator (deep A0 hum ~ 27.5Hz)
      this.subOsc = this.ctx.createOscillator();
      this.subOsc.type = "sine";
      this.subOsc.frequency.setValueAtTime(32.7, t); // Low C

      // Primary harmonic oscillator (dark triangle ~ 55Hz)
      this.osc1 = this.ctx.createOscillator();
      this.osc1.type = "sawtooth";
      this.osc1.frequency.setValueAtTime(65.41, t); // C2

      // Detuned harmonic overtone oscillator
      this.osc2 = this.ctx.createOscillator();
      this.osc2.type = "triangle";
      this.osc2.frequency.setValueAtTime(98.0, t); // G2

      // LFO for organic atmospheric breathing
      this.lfo = this.ctx.createOscillator();
      this.lfo.frequency.setValueAtTime(0.12, t); // 0.12 Hz cycle
      this.lfoGain = this.ctx.createGain();
      this.lfoGain.gain.setValueAtTime(35, t);

      this.lfo.connect(this.lfoGain);
      this.lfoGain.connect(this.filter.frequency);

      // Routing
      this.subOsc.connect(this.droneGain);
      this.osc1.connect(this.filter);
      this.osc2.connect(this.filter);
      this.filter.connect(this.droneGain);
      this.droneGain.connect(this.masterGain);

      this.subOsc.start(t);
      this.osc1.start(t);
      this.osc2.start(t);
      this.lfo.start(t);

      this.isInitialized = true;
    } catch {
      // Ignore
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (!this.isInitialized) {
      if (!muted) this.init();
    }
    if (!this.ctx || !this.droneGain) return;

    if (this.ctx.state === "suspended" && !muted) {
      this.ctx.resume().catch(() => {});
    }

    const t = this.ctx.currentTime;
    const targetGain = muted ? 0 : 0.08 * this.volume;
    this.droneGain.gain.setTargetAtTime(targetGain, t, 0.4);
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (!this.ctx || !this.masterGain) return;
    this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.1);
    if (!this.isMuted && this.droneGain) {
      this.droneGain.gain.setTargetAtTime(0.08 * this.volume, this.ctx.currentTime, 0.1);
    }
  }

  public updateScrollSpeed(velocity: number) {
    if (!this.ctx || !this.filter || this.isMuted) return;
    const t = this.ctx.currentTime;
    const clampedVel = Math.min(2.5, Math.abs(velocity));
    const targetFreq = 140 + clampedVel * 220;
    this.filter.frequency.setTargetAtTime(targetFreq, t, 0.15);
  }

  // --- INTERACTIVE SFX ---

  public playHover() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(1400, t);
      osc.frequency.exponentialRampToValueAtTime(2400, t + 0.04);

      gain.gain.setValueAtTime(0.02 * this.volume, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.05);
    } catch {}
  }

  public playClick() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.exponentialRampToValueAtTime(320, t + 0.08);

      gain.gain.setValueAtTime(0.08 * this.volume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.1);
    } catch {}
  }

  public playTeleport() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(120, t);
      osc.frequency.exponentialRampToValueAtTime(740, t + 0.28);

      filter.type = "bandpass";
      filter.frequency.setValueAtTime(600, t);
      filter.Q.setValueAtTime(6, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.06 * this.volume, t + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.36);
    } catch {}
  }

  public playSuccess() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    try {
      const t = this.ctx.currentTime;
      const chords = [523.25, 659.25, 783.99, 1046.5]; // C Major
      chords.forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, t + idx * 0.05);

        gain.gain.setValueAtTime(0.001, t + idx * 0.05);
        gain.gain.linearRampToValueAtTime(0.04 * this.volume, t + idx * 0.05 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.05 + 0.6);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t + idx * 0.05);
        osc.stop(t + idx * 0.05 + 0.65);
      });
    } catch {}
  }

  public playDecryption() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    try {
      const t = this.ctx.currentTime;
      for (let i = 0; i < 4; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "square";
        osc.frequency.setValueAtTime(1200 + Math.random() * 800, t + i * 0.04);

        gain.gain.setValueAtTime(0.015 * this.volume, t + i * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.04 + 0.03);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t + i * 0.04);
        osc.stop(t + i * 0.04 + 0.035);
      }
    } catch {}
  }
}

export const soundEngine = new SoundEngine();
