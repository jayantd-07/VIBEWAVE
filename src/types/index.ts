export type MoodType =
  | 'Happy'
  | 'Sad'
  | 'Romantic'
  | 'Calm'
  | 'Energetic'
  | 'Dark'
  | 'Dreamy'
  | 'Nostalgic'
  | 'Cinematic'
  | 'Focus';

export type SectionType = 'Intro' | 'Verse' | 'Chorus' | 'Drop' | 'Bridge' | 'Outro';

export interface SongSection {
  type: SectionType;
  startTime: number;
  endTime: number;
  label?: string;
}

export interface LyricLine {
  id: string;
  time: number; // in seconds
  text: string;
  duration?: number;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number; // in seconds
  audioUrl?: string; // Data URL or audio file path or synth identifier
  coverUrl: string;
  mood: MoodType;
  bpm: number;
  genre: string;
  bitDepth?: string; // e.g. "24-bit"
  sampleRate?: string; // e.g. "96 kHz"
  format?: string; // e.g. "FLAC", "WAV", "Hi-Res Synth"
  isHiFi?: boolean;
  lyrics?: LyricLine[];
  rawLyricsText?: string;
  sections?: SongSection[];
  isCustom?: boolean;
  isProcedural?: boolean; // synthesized hi-fi audio generator
  synthStyle?: 'cyberpunk' | 'lofi' | 'cinematic' | 'dnb' | 'ambient_piano';
  dateAdded?: number;
}

export interface AudioFeatures {
  rms: number; // 0..1
  energy: number; // 0..1
  bass: number; // 0..1
  lowMid: number; // 0..1
  mid: number; // 0..1
  highMid: number; // 0..1
  treble: number; // 0..1
  spectralCentroid: number; // 0..1
  spectralFlux: number; // 0..1
  isBeat: boolean;
  bpmEstimate: number;
  currentSection?: SectionType;
}

export type VisualizerMode =
  | 'auto'
  | 'spectrum'
  | 'waves'
  | 'particles'
  | 'neon'
  | 'cinematic'
  | 'ambient'
  | 'lyrics';

export interface MoodConfig {
  type: MoodType;
  label: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    glow: string;
    bgGradient: string;
  };
  particleCount: number;
  particleSpeed: number;
  pulseScale: number;
  description: string;
}

export interface EqualizerState {
  enabled: boolean;
  bassBoost: boolean;
  spatial3D: boolean;
  preset: string;
  bands: number[]; // 10 bands [-12dB to +12dB]
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverUrl?: string;
  trackIds: string[];
  createdAt: number;
}
