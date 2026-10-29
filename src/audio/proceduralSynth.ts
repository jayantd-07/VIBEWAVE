/**
 * Real-time Procedural Audio Synthesizer Engine
 * Generates dynamic multi-instrument music (bass, kick, snare, hi-hats, pads, lead synth)
 * completely in-browser via Web Audio API, with zero external network audio files!
 */

export interface SynthPattern {
  style: 'cyberpunk' | 'lofi' | 'cinematic' | 'dnb' | 'ambient_piano';
  bpm: number;
}

export class ProceduralSynthEngine {
  private ctx: AudioContext;
  private outputNode: AudioNode;
  private isRunning = false;
  private timerId: number | null = null;
  private currentStep = 0;
  private bpm = 128;
  private style: 'cyberpunk' | 'lofi' | 'cinematic' | 'dnb' | 'ambient_piano' = 'cyberpunk';
  private masterSynthGain: GainNode;

  // Scales & Note Frequencies (Hz)
  // Cyberpunk Synthwave: A Minor / D Minor
  private cyberLeadNotes = [220, 261.63, 293.66, 329.63, 392.0, 440, 523.25];
  private cyberBassNotes = [55, 55, 65.41, 73.42, 55, 82.41, 73.42, 65.41];

  // Lofi Chill: F Major / D Minor 7
  private lofiChords = [
    [174.61, 220.0, 261.63, 329.63], // Fmaj7
    [146.83, 174.61, 220.0, 261.63], // Dm7
    [130.81, 164.81, 196.0, 246.94], // Cmaj7
    [164.81, 196.0, 246.94, 293.66], // Em7
  ];

  // Cinematic: D Dorian / Epic Low Brass
  private cinematicNotes = [73.42, 87.31, 98.0, 110.0, 130.81, 146.83];

  constructor(ctx: AudioContext, destination: AudioNode) {
    this.ctx = ctx;
    this.outputNode = destination;
    this.masterSynthGain = ctx.createGain();
    this.masterSynthGain.gain.value = 0.75;
    this.masterSynthGain.connect(destination);
  }

  public setStyle(style: 'cyberpunk' | 'lofi' | 'cinematic' | 'dnb' | 'ambient_piano', bpm: number) {
    this.style = style;
    this.bpm = bpm;
  }

  public start(startTimeSec = 0) {
    if (this.isRunning) return;
    this.isRunning = true;
    this.currentStep = Math.floor((startTimeSec / (60 / this.bpm / 4))) % 64;

    const stepInterval = (60 / this.bpm / 4) * 1000; // 16th notes
    this.timerId = window.setInterval(() => {
      this.step();
    }, stepInterval);
  }

  public stop() {
    this.isRunning = false;
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  private step() {
    if (!this.isRunning || this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime;
    const s = this.currentStep % 16;
    const bar = Math.floor(this.currentStep / 16) % 4;

    switch (this.style) {
      case 'cyberpunk':
      case 'dnb':
        this.playCyberpunkStep(s, bar, now);
        break;
      case 'lofi':
        this.playLofiStep(s, bar, now);
        break;
      case 'cinematic':
        this.playCinematicStep(s, bar, now);
        break;
      case 'ambient_piano':
        this.playAmbientStep(s, bar, now);
        break;
    }

    this.currentStep++;
  }

  // --- Cyberpunk Synthwave Beat ---
  private playCyberpunkStep(step: number, bar: number, time: number) {
    // 4-on-the-floor Punchy Kick
    if (step % 4 === 0) {
      this.triggerKick(time, 140, 45, 0.28);
    }

    // Heavy Snare / Clap on 4 and 12
    if (step === 4 || step === 12) {
      this.triggerSnare(time, 0.22);
    }

    // 16th Note Hi-Hats
    if (step % 2 === 0) {
      this.triggerHiHat(time, step % 4 === 2 ? 0.08 : 0.04);
    }

    // Rolling 808 Synth Bass (every 8th note)
    if (step % 2 === 0) {
      const noteIdx = (bar * 2 + Math.floor(step / 2)) % this.cyberBassNotes.length;
      const freq = this.cyberBassNotes[noteIdx];
      this.triggerSynthBass(time, freq, 0.2, 'sawtooth');
    }

    // Arpeggiated Cyber Lead Melody
    if (step % 2 === 1 && bar >= 1) {
      const leadIdx = (step * 3 + bar) % this.cyberLeadNotes.length;
      this.triggerLead(time, this.cyberLeadNotes[leadIdx], 0.16, 'sawtooth');
    }
  }

  // --- Lofi Chill Ambient ---
  private playLofiStep(step: number, bar: number, time: number) {
    // Laid-back boom-bap kick
    if (step === 0 || step === 6 || step === 10) {
      this.triggerKick(time, 100, 38, 0.35);
    }
    // Rimshot / Snare on 4 and 12
    if (step === 4 || step === 12) {
      this.triggerSnare(time, 0.15, 600);
    }
    // Swing Hi-hat
    if (step % 2 === 0) {
      this.triggerHiHat(time, 0.03, true);
    }
    // Warm Rhodes electric piano chord on bar start
    if (step === 0) {
      const chord = this.lofiChords[bar % this.lofiChords.length];
      chord.forEach((freq, idx) => {
        this.triggerLead(time + idx * 0.02, freq, 1.8, 'triangle', 0.12);
      });
    }
  }

  // --- Cinematic Epic Orchestral ---
  private playCinematicStep(step: number, bar: number, time: number) {
    // Deep thunderous timpani impact on step 0 and 8
    if (step === 0 || step === 8) {
      this.triggerKick(time, 90, 28, 0.65);
    }
    // Low brass staccato pulse
    if (step % 4 === 0) {
      const note = this.cinematicNotes[bar % this.cinematicNotes.length];
      this.triggerSynthBass(time, note, 0.45, 'sawtooth', 0.22);
    }
    // Shimmering brass / string harmony
    if (step === 0) {
      this.triggerLead(time, 220 + bar * 30, 2.2, 'sawtooth', 0.14);
    }
  }

  // --- Ambient Piano / Romantic ---
  private playAmbientStep(step: number, bar: number, time: number) {
    if (step === 0 || step === 8) {
      // Soft sub drone
      this.triggerSynthBass(time, 65.41 + (bar % 3) * 12, 1.2, 'sine', 0.18);
    }
    // Gentle piano arpeggio
    if (step % 4 === 0) {
      const notes = [261.63, 329.63, 392.0, 523.25, 659.25];
      const note = notes[(step / 4 + bar) % notes.length];
      this.triggerLead(time, note, 0.8, 'sine', 0.2);
    }
  }

  // --- Sound Generation Nodes ---

  private triggerKick(time: number, startFreq: number, endFreq: number, duration: number) {
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(startFreq, time);
      osc.frequency.exponentialRampToValueAtTime(endFreq, time + duration);

      gain.gain.setValueAtTime(0.85, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc.connect(gain);
      gain.connect(this.masterSynthGain);

      osc.start(time);
      osc.stop(time + duration);
    } catch {}
  }

  private triggerSnare(time: number, duration = 0.2, centerFreq = 1200) {
    try {
      // Noise burst for snap
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(centerFreq, time);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.4, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterSynthGain);

      noise.start(time);
      noise.stop(time + duration);
    } catch {}
  }

  private triggerHiHat(time: number, duration = 0.05, closed = true) {
    try {
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(closed ? 7500 : 5000, time);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.2, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterSynthGain);

      noise.start(time);
      noise.stop(time + duration);
    } catch {}
  }

  private triggerSynthBass(
    time: number,
    freq: number,
    duration: number,
    type: OscillatorType = 'sawtooth',
    volume = 0.3
  ) {
    try {
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, time);
      filter.frequency.exponentialRampToValueAtTime(80, time + duration);

      gain.gain.setValueAtTime(volume, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterSynthGain);

      osc.start(time);
      osc.stop(time + duration);
    } catch {}
  }

  private triggerLead(
    time: number,
    freq: number,
    duration: number,
    type: OscillatorType = 'sawtooth',
    volume = 0.15
  ) {
    try {
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2400, time);

      gain.gain.setValueAtTime(volume, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterSynthGain);

      osc.start(time);
      osc.stop(time + duration);
    } catch {}
  }
}
