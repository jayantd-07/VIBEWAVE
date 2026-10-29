import { Track, AudioFeatures, SectionType } from '../types';
import { ProceduralSynthEngine } from './proceduralSynth';
import { calculateRms, extractFrequencyBands, calculateSpectralCentroid, BeatTracker } from '../utils/audioMath';

export const EQ_FREQUENCIES = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

export const EQ_PRESETS: Record<string, number[]> = {
  Flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  'Bass Boost': [5, 4.5, 3.5, 2, 0, 0, 0, 0, 1, 1],
  Electronic: [4.5, 3.5, 1, 0, -1, 2, 3, 4, 4.5, 4],
  Vocal: [-2, -1, 0, 2, 4.5, 4, 3, 2, 0, -1],
  Rock: [4, 3, 1.5, 0, -1, 1, 2.5, 3.5, 4, 4.5],
  Jazz: [3, 2, 1, 1.5, -1, 1, 2, 2.5, 3, 3],
  Classical: [4, 3, 2, 1.5, -1, -1, 0, 2, 3, 3.5],
  Acoustic: [3, 2, 1, 1, 2, 2, 3, 3.5, 3, 2],
};

type AudioEventListener = (event: string, data?: any) => void;

class AudioEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private masterGain: GainNode | null = null;
  private bassBoostNode: BiquadFilterNode | null = null;
  private pannerNode: StereoPannerNode | null = null;
  private eqFilters: BiquadFilterNode[] = [];

  // Audio source elements
  private audioElement: HTMLAudioElement | null = null;
  private audioSourceNode: MediaElementAudioSourceNode | null = null;
  private synthEngine: ProceduralSynthEngine | null = null;

  // State
  private currentTrack: Track | null = null;
  private isPlaying = false;
  private currentTime = 0;
  private duration = 0;
  private volume = 0.8;
  private isMuted = false;
  private listeners: Set<AudioEventListener> = new Set();
  private timerInterval: number | null = null;

  // FFT Data Buffers
  private freqData: Uint8Array<ArrayBuffer> | null = null;
  private timeData: Uint8Array<ArrayBuffer> | null = null;
  private beatTracker = new BeatTracker();

  constructor() {
    // Lazy initialize on first interaction
  }

  private initContext() {
    if (this.ctx) return;

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContextClass();

    // 1. Analyser Node
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 1024;
    this.analyser.smoothingTimeConstant = 0.82;
    this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
    this.timeData = new Uint8Array(this.analyser.fftSize);

    // 2. Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.isMuted ? 0 : this.volume;

    // 3. Stereo Panner (3D simulation)
    if (this.ctx.createStereoPanner) {
      this.pannerNode = this.ctx.createStereoPanner();
      this.pannerNode.pan.value = 0;
    }

    // 4. Bass Boost (lowshelf at 80Hz)
    this.bassBoostNode = this.ctx.createBiquadFilter();
    this.bassBoostNode.type = 'lowshelf';
    this.bassBoostNode.frequency.value = 80;
    this.bassBoostNode.gain.value = 0;

    // 5. 10-Band EQ Filters
    this.eqFilters = EQ_FREQUENCIES.map((freq) => {
      const filter = this.ctx!.createBiquadFilter();
      filter.type = 'peaking';
      filter.frequency.value = freq;
      filter.Q.value = 1.4;
      filter.gain.value = 0;
      return filter;
    });

    // Chain EQ filters in series
    let prevNode: AudioNode = this.eqFilters[0];
    for (let i = 1; i < this.eqFilters.length; i++) {
      prevNode.connect(this.eqFilters[i]);
      prevNode = this.eqFilters[i];
    }

    // Connect EQ output -> Bass Boost -> Panner (if available) -> Master Gain -> Analyser -> Destination
    prevNode.connect(this.bassBoostNode);
    if (this.pannerNode) {
      this.bassBoostNode.connect(this.pannerNode);
      this.pannerNode.connect(this.masterGain);
    } else {
      this.bassBoostNode.connect(this.masterGain);
    }

    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    // Initialize Procedural Synth engine connected to EQ input
    this.synthEngine = new ProceduralSynthEngine(this.ctx, this.eqFilters[0]);

    // Setup HTML5 Audio element for custom MP3/WAV uploads
    this.audioElement = new Audio();
    this.audioElement.crossOrigin = 'anonymous';
    this.audioElement.preload = 'auto';

    this.audioElement.addEventListener('timeupdate', () => {
      if (this.currentTrack && !this.currentTrack.isProcedural) {
        this.currentTime = this.audioElement?.currentTime || 0;
        this.emit('timeupdate', { currentTime: this.currentTime, duration: this.duration });
      }
    });

    this.audioElement.addEventListener('ended', () => {
      this.isPlaying = false;
      this.emit('ended');
    });

    this.audioElement.addEventListener('loadedmetadata', () => {
      if (this.audioElement?.duration && isFinite(this.audioElement.duration)) {
        this.duration = this.audioElement.duration;
        this.emit('loadedmetadata', { duration: this.duration });
      }
    });

    // Connect HTML5 Audio Source
    try {
      this.audioSourceNode = this.ctx.createMediaElementSource(this.audioElement);
      this.audioSourceNode.connect(this.eqFilters[0]);
    } catch (e) {
      console.warn('MediaElementSource initialization warning', e);
    }
  }

  public async resumeContext() {
    this.initContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  public async loadTrack(track: Track, autoPlay = true) {
    await this.resumeContext();
    this.currentTrack = track;
    this.currentTime = 0;
    this.duration = track.duration || 120;

    // Reset previous audio
    if (this.audioElement) {
      this.audioElement.pause();
    }
    if (this.synthEngine) {
      this.synthEngine.stop();
    }
    if (this.timerInterval !== null) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    if (track.isProcedural) {
      this.synthEngine?.setStyle(track.synthStyle || 'cyberpunk', track.bpm || 128);
    } else if (track.audioUrl && this.audioElement) {
      this.audioElement.src = track.audioUrl;
      this.audioElement.currentTime = 0;
    }

    this.emit('trackchange', track);

    if (autoPlay) {
      await this.play();
    }
  }

  public async play() {
    await this.resumeContext();
    if (!this.currentTrack) return;

    this.isPlaying = true;

    if (this.currentTrack.isProcedural) {
      this.synthEngine?.start(this.currentTime);

      // Procedural clock interval
      if (this.timerInterval === null) {
        this.timerInterval = window.setInterval(() => {
          this.currentTime += 0.25;
          if (this.currentTime >= this.duration) {
            this.currentTime = this.duration;
            this.pause();
            this.emit('ended');
          } else {
            this.emit('timeupdate', { currentTime: this.currentTime, duration: this.duration });
          }
        }, 250);
      }
    } else if (this.audioElement && this.currentTrack.audioUrl) {
      try {
        await this.audioElement.play();
      } catch (err) {
        console.warn('Audio play request failed or deferred', err);
      }
    }

    this.emit('playstate', { isPlaying: true });
  }

  public pause() {
    this.isPlaying = false;
    if (this.synthEngine) {
      this.synthEngine.stop();
    }
    if (this.timerInterval !== null) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.audioElement) {
      this.audioElement.pause();
    }
    this.emit('playstate', { isPlaying: false });
  }

  public seek(seconds: number) {
    const target = Math.max(0, Math.min(seconds, this.duration));
    this.currentTime = target;

    if (this.currentTrack?.isProcedural) {
      if (this.isPlaying) {
        this.synthEngine?.stop();
        this.synthEngine?.start(target);
      }
    } else if (this.audioElement && this.currentTrack?.audioUrl) {
      this.audioElement.currentTime = target;
    }

    this.emit('timeupdate', { currentTime: this.currentTime, duration: this.duration });
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(
        this.isMuted ? 0 : this.volume,
        this.ctx.currentTime
      );
    }
    this.emit('volumechange', { volume: this.volume, isMuted: this.isMuted });
  }

  public setMute(mute: boolean) {
    this.isMuted = mute;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(
        this.isMuted ? 0 : this.volume,
        this.ctx.currentTime
      );
    }
    this.emit('volumechange', { volume: this.volume, isMuted: this.isMuted });
  }

  public setEqualizerBands(bands: number[]) {
    this.initContext();
    bands.forEach((gainDb, index) => {
      if (this.eqFilters[index] && this.ctx) {
        this.eqFilters[index].gain.setValueAtTime(gainDb, this.ctx.currentTime);
      }
    });
  }

  public setBassBoost(enabled: boolean) {
    this.initContext();
    if (this.bassBoostNode && this.ctx) {
      this.bassBoostNode.gain.setValueAtTime(enabled ? 8 : 0, this.ctx.currentTime);
    }
  }

  public setSpatial3D(enabled: boolean) {
    this.initContext();
    // Simulate subtle 3D expansion with panning oscillation / widening
    if (this.pannerNode && this.ctx) {
      this.pannerNode.pan.setValueAtTime(enabled ? 0.25 : 0, this.ctx.currentTime);
    }
  }

  public getFrequencyData(): Uint8Array<ArrayBuffer> {
    if (this.analyser && this.freqData) {
      this.analyser.getByteFrequencyData(this.freqData);
      return this.freqData;
    }
    return new Uint8Array(512);
  }

  public getTimeDomainData(): Uint8Array<ArrayBuffer> {
    if (this.analyser && this.timeData) {
      this.analyser.getByteTimeDomainData(this.timeData);
      return this.timeData;
    }
    return new Uint8Array(512);
  }

  public getAudioFeatures(): AudioFeatures {
    const freq = this.getFrequencyData();
    const time = this.getTimeDomainData();

    const rms = calculateRms(time);
    const bands = extractFrequencyBands(freq, this.ctx?.sampleRate || 44100);
    const spectralCentroid = calculateSpectralCentroid(freq);
    const beatInfo = this.beatTracker.detect(bands.bass, performance.now());

    // Determine current section if metadata exists
    let currentSection: SectionType | undefined;
    if (this.currentTrack?.sections && this.currentTrack.sections.length > 0) {
      const match = this.currentTrack.sections.find(
        (sec) => this.currentTime >= sec.startTime && this.currentTime <= sec.endTime
      );
      if (match) {
        currentSection = match.type;
      }
    }

    return {
      rms,
      energy: bands.energy,
      bass: bands.bass,
      lowMid: bands.lowMid,
      mid: bands.mid,
      highMid: bands.highMid,
      treble: bands.treble,
      spectralCentroid,
      spectralFlux: 0.5,
      isBeat: beatInfo.isBeat,
      bpmEstimate: this.currentTrack?.bpm || beatInfo.estimatedBpm,
      currentSection,
    };
  }

  public getState() {
    return {
      isPlaying: this.isPlaying,
      currentTime: this.currentTime,
      duration: this.duration,
      volume: this.volume,
      isMuted: this.isMuted,
      track: this.currentTrack,
    };
  }

  public addListener(listener: AudioEventListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(event: string, data?: any) {
    this.listeners.forEach((fn) => fn(event, data));
  }
}

export const audioEngine = new AudioEngine();
