// Web Audio API Dark Ambient / Cyberpunk Tech Atmospheric Soundtrack Engine

// Standard frequencies for ambient pad voicings and drones (in Hz)
const FREQS: Record<string, number> = {
  // Deep Sub-Bass Drone Frequencies (40Hz - 60Hz)
  'D1': 36.71,
  'Eb1': 38.89,
  'E1': 41.20,
  'F1': 43.65,
  'G1': 49.00,
  'A1': 55.00,
  'Bb1': 58.27,
  'C2': 65.41,
  'D2': 73.42,
  'E2': 82.41,
  'F2': 87.31,
  'G2': 98.00,
  'A2': 110.00,
  'Bb2': 116.54,
  'C3': 130.81,
  'D3': 146.83,
  'E3': 164.81,
  'F3': 174.61,
  'G3': 196.00,
  'A3': 220.00,
  'Bb3': 233.08,
  'C4': 261.63,
  'D4': 293.66,
  'E4': 329.63,
  'F4': 349.23,
  'G4': 392.00,
  'A4': 440.00,
  'Bb4': 466.16,
  'C5': 523.25,
  'D5': 587.33,
  'E5': 659.25,
  'F5': 698.46,
  'G5': 783.99,
  'A5': 880.00,
  'C6': 1046.50,
  'D6': 1174.66,
  'E6': 1318.51,
  'F6': 1396.91,
  'A6': 1760.00,
  'C7': 2093.00,
  'E7': 2637.02,
};

// Dark Cyberpunk / Quantum Lab Evolving Ambient Chord Voicings
interface AmbientChord {
  droneFreq: number; // Sub-bass 40Hz - 60Hz
  padFreqs: number[]; // Rich Sine/Triangle harmony cluster
  sparkleFreqs: number[]; // High-frequency crystalline pings
  duration: number; // Duration in seconds before transitioning to next chord
}

const AMBIENT_CHORDS: AmbientChord[] = [
  // Chord 1: Dm9 (Deep Quantum Core)
  {
    droneFreq: FREQS['D1'], // 36.7Hz sub
    padFreqs: [FREQS['D2'], FREQS['A2'], FREQS['F3'], FREQS['C4'], FREQS['E4']],
    sparkleFreqs: [FREQS['A5'], FREQS['D6'], FREQS['E6'], FREQS['A6']],
    duration: 8.0,
  },
  // Chord 2: Bbmaj7(#11) (Silicon Substrate Resonance)
  {
    droneFreq: FREQS['Bb1'], // 58.3Hz sub
    padFreqs: [FREQS['Bb2'], FREQS['F3'], FREQS['D4'], FREQS['A4'], FREQS['E5']],
    sparkleFreqs: [FREQS['F6'], FREQS['A6'], FREQS['C7']],
    duration: 8.0,
  },
  // Chord 3: Csus2(add #11) / G (Cryogenic Flux)
  {
    droneFreq: FREQS['G1'], // 49.0Hz sub
    padFreqs: [FREQS['C3'], FREQS['G3'], FREQS['D4'], FREQS['E4'], FREQS['A4']],
    sparkleFreqs: [FREQS['G5'], FREQS['D6'], FREQS['E7']],
    duration: 8.0,
  },
  // Chord 4: A7sus4 / D (Superposition Harmonic)
  {
    droneFreq: FREQS['A1'], // 55.0Hz sub
    padFreqs: [FREQS['A2'], FREQS['E3'], FREQS['G3'], FREQS['D4'], FREQS['C5']],
    sparkleFreqs: [FREQS['A5'], FREQS['C6'], FREQS['E6'], FREQS['A6']],
    duration: 8.0,
  },
];

class AudioEngine {
  private ctx: AudioContext | null = null;
  private musicGainNode: GainNode | null = null;
  private sfxGainNode: GainNode | null = null;
  private masterFilter: BiquadFilterNode | null = null;

  // Ambient Pad & Filter Modulation Nodes
  private padFilter: BiquadFilterNode | null = null;
  private padLfo: OscillatorNode | null = null;
  private padLfoGain: GainNode | null = null;

  // Space & Delay Feedback Network
  private delayNode: DelayNode | null = null;
  private delayFeedbackGain: GainNode | null = null;
  private delayFilter: BiquadFilterNode | null = null;
  private delayInputGain: GainNode | null = null;

  // Deep Sub-Bass Drone Nodes
  private droneOsc: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;

  private isMusicPlaying = false;
  private musicVolume = 0.5;
  private isMusicMuted = false;

  private sfxVolume = 0.8;
  private isSfxMuted = false;

  // Ambient Sequencer State
  private chordIndex = 0;
  private nextChordTime = 0;
  private timerId: number | null = null;
  private sparkleTimerId: number | null = null;

  // Cached White Noise Buffer for mechanical clicks and transients
  private noiseBuffer: AudioBuffer | null = null;

  constructor() {
    // Lazy initialized on first user gesture
  }

  private getNoiseBuffer(): AudioBuffer | null {
    if (!this.ctx) return null;
    if (!this.noiseBuffer) {
      const sampleRate = this.ctx.sampleRate;
      const bufferSize = sampleRate; // 1-second white noise buffer
      this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    }
    return this.noiseBuffer;
  }

  public init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return;
    }

    try {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();

      // Master output filter (smooth analog warmth without high-frequency digital harshness)
      this.masterFilter = this.ctx.createBiquadFilter();
      this.masterFilter.type = 'lowpass';
      this.masterFilter.frequency.setValueAtTime(10000, this.ctx.currentTime);
      this.masterFilter.connect(this.ctx.destination);

      // Music Master Gain Node
      this.musicGainNode = this.ctx.createGain();
      this.updateMusicGain();
      this.musicGainNode.connect(this.masterFilter);

      // SFX Master Gain Node
      this.sfxGainNode = this.ctx.createGain();
      this.updateSfxGain();
      this.sfxGainNode.connect(this.masterFilter);

      // 1. Setup Space & Delay Network (Cavernous Tech Delay)
      this.delayNode = this.ctx.createDelay(2.0);
      this.delayNode.delayTime.setValueAtTime(0.52, this.ctx.currentTime); // 520ms spacious echo

      this.delayFeedbackGain = this.ctx.createGain();
      this.delayFeedbackGain.gain.setValueAtTime(0.48, this.ctx.currentTime); // Smooth feedback loop

      this.delayFilter = this.ctx.createBiquadFilter();
      this.delayFilter.type = 'lowpass';
      this.delayFilter.frequency.setValueAtTime(2600, this.ctx.currentTime); // Dampened high reflections

      this.delayInputGain = this.ctx.createGain();
      this.delayInputGain.gain.setValueAtTime(0.65, this.ctx.currentTime);

      // Delay Loop: Input -> DelayNode -> DelayFilter -> Feedback -> DelayNode
      this.delayInputGain.connect(this.delayNode);
      this.delayNode.connect(this.delayFilter);
      this.delayFilter.connect(this.delayFeedbackGain);
      this.delayFeedbackGain.connect(this.delayNode);

      // Send wet delay signal to music master
      this.delayFilter.connect(this.musicGainNode);

      // 2. Setup Pad Lowpass Filter with 'Breathing' Slow LFO Filter Sweep
      this.padFilter = this.ctx.createBiquadFilter();
      this.padFilter.type = 'lowpass';
      this.padFilter.frequency.setValueAtTime(750, this.ctx.currentTime);
      this.padFilter.Q.setValueAtTime(2.2, this.ctx.currentTime); // Resonant warmth

      // Very slow LFO (0.07 Hz = ~14-second organic breathing cycle)
      this.padLfo = this.ctx.createOscillator();
      this.padLfo.type = 'sine';
      this.padLfo.frequency.setValueAtTime(0.07, this.ctx.currentTime);

      this.padLfoGain = this.ctx.createGain();
      this.padLfoGain.gain.setValueAtTime(500, this.ctx.currentTime); // Modulates filter between 250Hz and 1250Hz

      this.padLfo.connect(this.padLfoGain);
      this.padLfoGain.connect(this.padFilter.frequency);
      this.padLfo.start();

      // Route Pad Filter to both music master output and delay network
      this.padFilter.connect(this.musicGainNode);
      if (this.delayInputGain) {
        const padSendToDelay = this.ctx.createGain();
        padSendToDelay.gain.setValueAtTime(0.28, this.ctx.currentTime);
        this.padFilter.connect(padSendToDelay);
        padSendToDelay.connect(this.delayInputGain);
      }

      // 3. Setup Constant Sub-Bass Drone
      this.droneOsc = this.ctx.createOscillator();
      this.droneOsc.type = 'sine';
      this.droneOsc.frequency.setValueAtTime(FREQS['D1'] || 36.71, this.ctx.currentTime);

      this.droneGain = this.ctx.createGain();
      this.droneGain.gain.setValueAtTime(0.001, this.ctx.currentTime);

      this.droneOsc.connect(this.droneGain);
      this.droneGain.connect(this.musicGainNode);
      this.droneOsc.start();
    } catch (e) {
      console.warn('Web Audio API not supported or initialized:', e);
    }
  }

  // --- Volume & Mute Controls ---
  public setMusicVolume(vol: number) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    this.updateMusicGain();
    if (this.musicVolume > 0 && !this.isMusicMuted && !this.isMusicPlaying && this.ctx && this.ctx.state !== 'suspended') {
      this.startMusic();
    }
  }

  public getMusicVolume(): number {
    return this.musicVolume;
  }

  public setMusicMuted(muted: boolean) {
    this.isMusicMuted = muted;
    if (muted) {
      if (this.musicGainNode && this.ctx) {
        const now = this.ctx.currentTime;
        this.musicGainNode.gain.cancelScheduledValues(now);
        this.musicGainNode.gain.setValueAtTime(0, now);
      }
      this.stopMusic();
    } else {
      this.updateMusicGain();
      if (this.musicVolume > 0 && !this.isMusicPlaying && this.ctx && this.ctx.state !== 'suspended') {
        this.startMusic();
      }
    }
  }

  public getMusicMuted(): boolean {
    return this.isMusicMuted;
  }

  public setSfxVolume(vol: number) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    this.updateSfxGain();
  }

  public getSfxVolume(): number {
    return this.sfxVolume;
  }

  public setSfxMuted(muted: boolean) {
    this.isSfxMuted = muted;
    if (muted && this.sfxGainNode && this.ctx) {
      const now = this.ctx.currentTime;
      this.sfxGainNode.gain.cancelScheduledValues(now);
      this.sfxGainNode.gain.setValueAtTime(0, now);
    } else {
      this.updateSfxGain();
    }
  }

  public getSfxMuted(): boolean {
    return this.isSfxMuted;
  }

  private updateMusicGain() {
    if (!this.musicGainNode || !this.ctx) return;
    const target = this.isMusicMuted ? 0 : this.musicVolume * 0.38; // Master ambient volume
    const now = this.ctx.currentTime;
    this.musicGainNode.gain.cancelScheduledValues(now);
    if (this.isMusicMuted || this.musicVolume === 0) {
      this.musicGainNode.gain.setValueAtTime(0, now);
    } else {
      this.musicGainNode.gain.linearRampToValueAtTime(target, now + 0.1);
    }
  }

  private updateSfxGain() {
    if (!this.sfxGainNode || !this.ctx) return;
    const target = this.isSfxMuted ? 0 : this.sfxVolume * 0.6;
    const now = this.ctx.currentTime;
    this.sfxGainNode.gain.cancelScheduledValues(now);
    if (this.isSfxMuted || this.sfxVolume === 0) {
      this.sfxGainNode.gain.setValueAtTime(0, now);
    } else {
      this.sfxGainNode.gain.linearRampToValueAtTime(target, now + 0.05);
    }
  }

  // --- Dark Ambient Music Sequencer & Pad Voice Generator ---
  public startMusic() {
    this.init();
    if (this.isMusicMuted || this.musicVolume === 0) {
      if (this.musicGainNode && this.ctx) {
        const now = this.ctx.currentTime;
        this.musicGainNode.gain.cancelScheduledValues(now);
        this.musicGainNode.gain.setValueAtTime(0, now);
      }
      return;
    }
    if (this.isMusicPlaying) return;
    this.isMusicPlaying = true;

    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      this.updateMusicGain();

      // Slowly fade in sub-bass drone
      if (this.droneGain) {
        const now = this.ctx.currentTime;
        this.droneGain.gain.cancelScheduledValues(now);
        this.droneGain.gain.setValueAtTime(0.001, now);
        this.droneGain.gain.exponentialRampToValueAtTime(0.24, now + 3.0); // Gentle 3s sub-bass swell
      }

      this.chordIndex = 0;
      this.nextChordTime = this.ctx.currentTime + 0.1;
      this.ambientScheduler();
      this.scheduleRandomSparkle();
    }
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
    if (this.sparkleTimerId !== null) {
      window.clearTimeout(this.sparkleTimerId);
      this.sparkleTimerId = null;
    }

    if (this.ctx) {
      const now = this.ctx.currentTime;
      if (this.droneGain) {
        this.droneGain.gain.cancelScheduledValues(now);
        this.droneGain.gain.linearRampToValueAtTime(0.0001, now + 1.5);
      }
      if (this.musicGainNode) {
        this.musicGainNode.gain.cancelScheduledValues(now);
        this.musicGainNode.gain.linearRampToValueAtTime(0, now + 1.5);
      }
    }
  }

  private ambientScheduler = () => {
    if (!this.isMusicPlaying || !this.ctx) return;

    // Lookahead: schedule chords ahead of time
    while (this.nextChordTime < this.ctx.currentTime + 1.5) {
      const chord = AMBIENT_CHORDS[this.chordIndex];
      this.playEvolvingPadChord(chord, this.nextChordTime);
      this.nextChordTime += chord.duration;
      this.chordIndex = (this.chordIndex + 1) % AMBIENT_CHORDS.length;
    }

    this.timerId = window.setTimeout(this.ambientScheduler, 400);
  };

  /**
   * Plays a lush, evolving multi-voice synth pad chord with long Attack (2.5s-3.5s)
   * and long Release (3.5s-4.5s) overlapping into the subsequent harmony.
   */
  private playEvolvingPadChord(chord: AmbientChord, startTime: number) {
    if (!this.ctx || !this.padFilter || !this.musicGainNode) return;

    const attackTime = 3.0; // 3-second gentle attack swell
    const sustainTime = chord.duration - 1.0;
    const releaseTime = 4.0; // 4-second long overlapping release
    const totalDuration = sustainTime + releaseTime;

    // 1. Smoothly glide Sub-Bass Drone to the chord fundamental (Sine Wave ~40Hz - 60Hz)
    if (this.droneOsc && this.droneGain) {
      this.droneOsc.frequency.cancelScheduledValues(startTime);
      this.droneOsc.frequency.exponentialRampToValueAtTime(chord.droneFreq, startTime + 2.5);
    }

    // 2. Play Overlapping Pad Voices (Sine + Triangle layers with gentle micro-detuning)
    chord.padFreqs.forEach((baseFreq, voiceIndex) => {
      if (!this.ctx || !this.padFilter) return;

      // Layer A: Warm Triangle oscillator
      const oscTri = this.ctx.createOscillator();
      const gainTri = this.ctx.createGain();
      oscTri.type = 'triangle';
      oscTri.frequency.setValueAtTime(baseFreq, startTime);
      // Subtle micro-detune for lush cinematic width (+2.5 cents)
      oscTri.detune.setValueAtTime(2.5, startTime);

      // Long Attack & Release Envelope
      const targetGain = 0.045 / Math.sqrt(chord.padFreqs.length);
      gainTri.gain.setValueAtTime(0.0001, startTime);
      gainTri.gain.exponentialRampToValueAtTime(targetGain, startTime + attackTime);
      gainTri.gain.setValueAtTime(targetGain, startTime + sustainTime);
      gainTri.gain.exponentialRampToValueAtTime(0.0001, startTime + totalDuration);

      oscTri.connect(gainTri);
      gainTri.connect(this.padFilter);

      oscTri.start(startTime);
      oscTri.stop(startTime + totalDuration + 0.1);

      // Layer B: Deep Pure Sine oscillator
      const oscSine = this.ctx.createOscillator();
      const gainSine = this.ctx.createGain();
      oscSine.type = 'sine';
      oscSine.frequency.setValueAtTime(baseFreq, startTime);
      oscSine.detune.setValueAtTime(-2.5, startTime); // -2.5 cents detune

      gainSine.gain.setValueAtTime(0.0001, startTime);
      gainSine.gain.exponentialRampToValueAtTime(targetGain * 0.9, startTime + attackTime + 0.3);
      gainSine.gain.setValueAtTime(targetGain * 0.9, startTime + sustainTime);
      gainSine.gain.exponentialRampToValueAtTime(0.0001, startTime + totalDuration);

      oscSine.connect(gainSine);
      gainSine.connect(this.padFilter);

      oscSine.start(startTime);
      oscSine.stop(startTime + totalDuration + 0.1);
    });
  }

  /**
   * Schedules high-frequency quantum sparkles and slow echoing pings through the Delay Network
   */
  private scheduleRandomSparkle = () => {
    if (!this.isMusicPlaying || !this.ctx) return;

    const currentChord = AMBIENT_CHORDS[this.chordIndex];
    if (currentChord && currentChord.sparkleFreqs.length > 0) {
      const randomFreq =
        currentChord.sparkleFreqs[Math.floor(Math.random() * currentChord.sparkleFreqs.length)];
      const now = this.ctx.currentTime + 0.05;
      this.playHighTechSparkle(randomFreq, now);
    }

    // Interval between ambient pings (staggered 2.2s to 4.5s)
    const nextInterval = 2200 + Math.random() * 2300;
    this.sparkleTimerId = window.setTimeout(this.scheduleRandomSparkle, nextInterval);
  };

  /**
   * Generates a high-frequency ethereal ping that rings through the cavernous delay network
   */
  private playHighTechSparkle(freq: number, time: number) {
    if (!this.ctx || !this.delayInputGain || !this.musicGainNode) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    // Envelope: quick gentle attack, shimmering decay
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(0.06, time + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.9);

    osc.connect(gain);
    // Send directly to both master and the delay feedback network
    gain.connect(this.musicGainNode);
    gain.connect(this.delayInputGain);

    osc.start(time);
    osc.stop(time + 1.0);
  }

  // --- Sound Effects (SFX) ---
  public playSfx(
    type:
      | 'click'
      | 'crit'
      | 'upgrade'
      | 'research'
      | 'pause'
      | 'resume'
      | 'rebirth'
      | 'quantum'
      | 'glitch'
      | 'achievement'
  ) {
    this.init();
    if (this.isSfxMuted || !this.ctx || !this.sfxGainNode) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.sfxGainNode);

      if (type === 'click') {
        // 1. Tactile mechanical switch noise transient (0.025s bandpassed burst)
        const noiseBuf = this.getNoiseBuffer();
        if (noiseBuf) {
          const noiseSource = this.ctx.createBufferSource();
          noiseSource.buffer = noiseBuf;
          noiseSource.loop = true;

          const noiseFilter = this.ctx.createBiquadFilter();
          noiseFilter.type = 'bandpass';
          noiseFilter.frequency.setValueAtTime(1900, now);
          noiseFilter.Q.setValueAtTime(1.8, now);

          const noiseGain = this.ctx.createGain();
          noiseGain.gain.setValueAtTime(0.09, now);
          noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.028);

          noiseSource.connect(noiseFilter);
          noiseFilter.connect(noiseGain);
          noiseGain.connect(this.sfxGainNode);

          noiseSource.start(now);
          noiseSource.stop(now + 0.032);
        }

        // 2. Physical switch 'thud' pop: fast Sine wave pitch drop (400Hz -> 140Hz in 0.03s)
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.03);

        oscGain.gain.setValueAtTime(0.18, now);
        oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

        osc.connect(oscGain);
        oscGain.connect(this.sfxGainNode);

        osc.start(now);
        osc.stop(now + 0.04);
      } else if (type === 'crit') {
        // 1. Ultra-short high-passed noise burst (glass marble / coin contact transient)
        const noiseBuf = this.getNoiseBuffer();
        if (noiseBuf) {
          const noiseSource = this.ctx.createBufferSource();
          noiseSource.buffer = noiseBuf;
          noiseSource.loop = true;

          const noiseFilter = this.ctx.createBiquadFilter();
          noiseFilter.type = 'highpass';
          noiseFilter.frequency.setValueAtTime(4200, now);

          const noiseGain = this.ctx.createGain();
          noiseGain.gain.setValueAtTime(0.08, now);
          noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);

          noiseSource.connect(noiseFilter);
          noiseFilter.connect(noiseGain);
          noiseGain.connect(this.sfxGainNode);

          noiseSource.start(now);
          noiseSource.stop(now + 0.025);
        }

        // 2. Satisfying glassy pop: Two Sine waves playing a tight harmonic Perfect Fifth (C5 523.25Hz + G5 783.99Hz)
        const tones = [
          { freq: 523.25, gain: 0.22 }, // C5
          { freq: 783.99, gain: 0.17 }, // G5
        ];

        tones.forEach(({ freq, gain: targetGain }) => {
          if (!this.ctx || !this.sfxGainNode) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);

          // Fast attack and snappy exponential decay (<= 0.14s total)
          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.linearRampToValueAtTime(targetGain, now + 0.003);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);

          osc.connect(gain);
          gain.connect(this.sfxGainNode);

          osc.start(now);
          osc.stop(now + 0.14);
        });
      } else if (type === 'glitch') {
        // High-energy hyperdrive sparkle
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1760, now + 0.08);
        osc.frequency.exponentialRampToValueAtTime(3520, now + 0.2);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.start(now);
        osc.stop(now + 0.28);
      } else if (type === 'achievement') {
        // Grand victory chord arpeggio
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
        osc.frequency.setValueAtTime(1046.5, now + 0.24); // C6
        osc.frequency.setValueAtTime(1318.51, now + 0.32); // E6
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
        osc.start(now);
        osc.stop(now + 0.55);
      } else if (type === 'upgrade') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(640, now + 0.06);
        osc.frequency.exponentialRampToValueAtTime(960, now + 0.15);
        gain.gain.setValueAtTime(0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      } else if (type === 'research') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.07);
        osc.frequency.setValueAtTime(783.99, now + 0.14);
        osc.frequency.setValueAtTime(1046.5, now + 0.21);
        gain.gain.setValueAtTime(0.32, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
        osc.start(now);
        osc.stop(now + 0.32);
      } else if (type === 'pause') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(260, now + 0.12);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'resume') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(520, now + 0.12);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'quantum') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.2); // D6
        osc.frequency.exponentialRampToValueAtTime(1760.0, now + 0.4); // A6
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.45);
      } else if (type === 'rebirth') {
        // Dramatic multi-oscillator warp sweep
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(130.81, now);
        osc.frequency.exponentialRampToValueAtTime(65.41, now + 0.3);
        osc.frequency.exponentialRampToValueAtTime(1046.5, now + 1.2);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);
        osc.start(now);
        osc.stop(now + 1.3);

        // Sub harmonic layer
        const subOsc = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(55, now);
        subOsc.frequency.linearRampToValueAtTime(220, now + 1.0);
        subGain.gain.setValueAtTime(0.5, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        subOsc.connect(subGain);
        subGain.connect(this.sfxGainNode);
        subOsc.start(now);
        subOsc.stop(now + 1.2);
      }
    } catch {
      // Audio context might be restricted before user gesture
    }
  }
}

export const audioEngine = new AudioEngine();
