/**
 * Procedural Web Audio API sound generator for Kosmos Space Adventure.
 * Generates retro 8-bit/16-bit sound effects & cosmic space ambient arpeggios.
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private thrusterOsc: OscillatorNode | null = null;
  private thrusterGain: GainNode | null = null;
  private thrusterFilter: BiquadFilterNode | null = null;
  private isThrusterActive: boolean = false;
  private ambientInterval: number | null = null;
  private ambientStep: number = 0;

  constructor() {
    // Sound will initialize on first user interaction
  }

  private initContext() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.bgmGain.connect(this.masterGain);

      this.startAmbientMusic();
    } catch {
      console.warn('Web Audio not supported in this environment');
    }
  }

  public resume() {
    if (!this.ctx) {
      this.initContext();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.7, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // Laser blaster shot (dual tone retro sweep)
  public playLaser(pitchMultiplier = 1) {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880 * pitchMultiplier, t);
    osc.frequency.exponentialRampToValueAtTime(120 * pitchMultiplier, t + 0.14);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  // Enemy Laser shot
  public playEnemyLaser() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.18);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.19);
  }

  // Mining laser continuous ping
  public playMiningPulse() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600 + Math.random() * 200, t);
    osc.frequency.linearRampToValueAtTime(900, t + 0.05);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.07);
  }

  // Heavy or light explosion
  public playExplosion(isHeavy = false) {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const duration = isHeavy ? 0.6 : 0.35;

    // Sub rumble oscillator
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(isHeavy ? 130 : 180, t);
    subOsc.frequency.exponentialRampToValueAtTime(30, t + duration);

    subGain.gain.setValueAtTime(isHeavy ? 0.45 : 0.3, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    subOsc.connect(subGain);
    subGain.connect(this.sfxGain);
    subOsc.start(t);
    subOsc.stop(t + duration);

    // Noise crackle
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-3 * (i / bufferSize));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(isHeavy ? 450 : 800, t);
    filter.frequency.linearRampToValueAtTime(80, t + duration);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(isHeavy ? 0.4 : 0.25, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);

    noise.start(t);
    noise.stop(t + duration);
  }

  // Shield deflection or hit chime
  public playShieldHit() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(750, t);
    osc.frequency.exponentialRampToValueAtTime(250, t + 0.15);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.16);
  }

  // Sparkling resource pickup (crystal chime)
  public playPickup() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const notes = [587.33, 880, 1174.66, 1760]; // D5, A5, D6, A6
    notes.forEach((freq, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + i * 0.04);

      gain.gain.setValueAtTime(0.18, t + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.04 + 0.16);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t + i * 0.04);
      osc.stop(t + i * 0.04 + 0.18);
    });
  }

  // Mission completed fanfare
  public playMissionSuccess() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const chord = [440, 554.37, 659.25, 880]; // A major
    chord.forEach((freq) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.linearRampToValueAtTime(freq * 1.5, t + 0.4);

      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.65);
    });
  }

  // Warp or landing transit sound
  public playWarp() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, t);
    osc.frequency.exponentialRampToValueAtTime(1400, t + 0.7);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, t);
    filter.frequency.exponentialRampToValueAtTime(3000, t + 0.7);

    gain.gain.setValueAtTime(0.05, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.85);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.9);
  }

  // UI button click / beep
  public playClick(highPitch = false) {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(highPitch ? 1200 : 700, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.05);

    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.06);
  }

  // Thruster loop modulation
  public setThruster(active: boolean, boost = false) {
    if (this.isMuted || !this.ctx) return;
    if (active && !this.isThrusterActive) {
      this.isThrusterActive = true;
      try {
        const t = this.ctx.currentTime;
        this.thrusterOsc = this.ctx.createOscillator();
        this.thrusterFilter = this.ctx.createBiquadFilter();
        this.thrusterGain = this.ctx.createGain();

        this.thrusterOsc.type = 'triangle';
        this.thrusterOsc.frequency.setValueAtTime(boost ? 140 : 85, t);

        this.thrusterFilter.type = 'lowpass';
        this.thrusterFilter.frequency.setValueAtTime(boost ? 600 : 320, t);

        this.thrusterGain.gain.setValueAtTime(0.01, t);
        this.thrusterGain.gain.linearRampToValueAtTime(boost ? 0.22 : 0.12, t + 0.1);

        this.thrusterOsc.connect(this.thrusterFilter);
        this.thrusterFilter.connect(this.thrusterGain);
        if (this.sfxGain) {
          this.thrusterGain.connect(this.sfxGain);
        }
        this.thrusterOsc.start(t);
      } catch {
        // Safe fail
      }
    } else if (!active && this.isThrusterActive) {
      this.isThrusterActive = false;
      if (this.thrusterGain && this.ctx) {
        try {
          const t = this.ctx.currentTime;
          this.thrusterGain.gain.linearRampToValueAtTime(0.001, t + 0.1);
          setTimeout(() => {
            if (this.thrusterOsc) {
              try { this.thrusterOsc.stop(); } catch {}
              this.thrusterOsc.disconnect();
              this.thrusterOsc = null;
            }
          }, 120);
        } catch {
          // ignore
        }
      }
    }
  }

  // Planetary Weather siren alert
  public playStormAlert() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.linearRampToValueAtTime(640, t + 0.2);
    osc.frequency.linearRampToValueAtTime(320, t + 0.4);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.52);
  }

  // Rushing falling meteor sound
  public playMeteorStreak() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(900, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.35);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1800, t);
    filter.frequency.exponentialRampToValueAtTime(200, t + 0.35);

    gain.gain.setValueAtTime(0.14, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.4);
  }

  // Atmospheric wind gust
  public playWindGust() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const duration = 0.6;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((Math.PI * i) / bufferSize);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, t);
    filter.Q.setValueAtTime(2, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(t);
    noise.stop(t + duration);
  }

  // Procedural ambient cosmic synthesizer
  private startAmbientMusic() {
    if (this.ambientInterval) return;

    // Atmospheric arpeggiated sequence (Bm, G, D, A chords in cosmic register)
    const scale = [
      // Bm9
      [246.94, 293.66, 369.99, 440.00, 587.33],
      // Gmaj7
      [196.00, 246.94, 293.66, 369.99, 493.88],
      // Dadd9
      [220.00, 293.66, 369.99, 440.00, 659.25],
      // F#m7
      [185.00, 220.00, 277.18, 369.99, 554.37],
    ];

    this.ambientInterval = window.setInterval(() => {
      if (this.isMuted || !this.ctx || !this.bgmGain) return;
      if (this.ctx.state !== 'running') return;

      const chordIndex = Math.floor(this.ambientStep / 8) % scale.length;
      const currentChord = scale[chordIndex];
      const noteFreq = currentChord[this.ambientStep % currentChord.length];

      this.ambientStep++;

      // Play soft bell-like synth pad note
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(noteFreq, t);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, t);
      filter.frequency.exponentialRampToValueAtTime(250, t + 1.2);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.09, t + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.bgmGain);

      osc.start(t);
      osc.stop(t + 1.9);
    }, 450);
  }
}

export const soundManager = new SoundManager();
