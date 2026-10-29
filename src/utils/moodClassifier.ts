import { MoodConfig, MoodType, AudioFeatures } from '../types';

export const MOOD_CONFIGS: Record<MoodType, MoodConfig> = {
  Happy: {
    type: 'Happy',
    label: 'Happy & Euphoric',
    colors: {
      primary: '#f59e0b', // Amber 500
      secondary: '#ec4899', // Pink 500
      accent: '#fbbf24', // Amber 400
      glow: 'rgba(245, 158, 11, 0.45)',
      bgGradient: 'radial-gradient(ellipse at top, rgba(245, 158, 11, 0.22) 0%, rgba(236, 72, 153, 0.15) 45%, #07080d 85%)',
    },
    particleCount: 75,
    particleSpeed: 1.4,
    pulseScale: 1.18,
    description: 'Bright, buoyant vibrations with dancing harmonics and uplifting rhythms.',
  },
  Sad: {
    type: 'Sad',
    label: 'Sad & Melancholy',
    colors: {
      primary: '#3b82f6', // Blue 500
      secondary: '#6366f1', // Indigo 500
      accent: '#06b6d4', // Cyan 500
      glow: 'rgba(59, 130, 246, 0.35)',
      bgGradient: 'radial-gradient(ellipse at top, rgba(30, 58, 138, 0.25) 0%, rgba(99, 102, 241, 0.12) 50%, #07080d 90%)',
    },
    particleCount: 35,
    particleSpeed: 0.4,
    pulseScale: 1.05,
    description: 'Deep blue tones, soft ambient ripples, and contemplative falling lights.',
  },
  Romantic: {
    type: 'Romantic',
    label: 'Romantic & Intimate',
    colors: {
      primary: '#f43f5e', // Rose 500
      secondary: '#d946ef', // Fuchsia 500
      accent: '#fda4af', // Rose 300
      glow: 'rgba(244, 63, 94, 0.45)',
      bgGradient: 'radial-gradient(ellipse at top, rgba(244, 63, 94, 0.22) 0%, rgba(217, 70, 239, 0.14) 50%, #07080d 85%)',
    },
    particleCount: 55,
    particleSpeed: 0.7,
    pulseScale: 1.12,
    description: 'Warm crimson and fuchsia hues with soft floating orbs and tender waves.',
  },
  Calm: {
    type: 'Calm',
    label: 'Calm & Peaceful',
    colors: {
      primary: '#14b8a6', // Teal 500
      secondary: '#06b6d4', // Cyan 500
      accent: '#a7f3d0', // Emerald 200
      glow: 'rgba(20, 184, 166, 0.35)',
      bgGradient: 'radial-gradient(ellipse at top, rgba(20, 184, 166, 0.20) 0%, rgba(6, 182, 212, 0.12) 50%, #07080d 85%)',
    },
    particleCount: 40,
    particleSpeed: 0.5,
    pulseScale: 1.06,
    description: 'Tranquil ocean gradients, gentle fluid drift, and restorative soundscapes.',
  },
  Energetic: {
    type: 'Energetic',
    label: 'High Energy & Peak',
    colors: {
      primary: '#06b6d4', // Cyan 500
      secondary: '#f43f5e', // Rose 500
      accent: '#22c55e', // Green 500
      glow: 'rgba(6, 182, 212, 0.55)',
      bgGradient: 'radial-gradient(ellipse at top, rgba(6, 182, 212, 0.25) 0%, rgba(244, 63, 94, 0.18) 55%, #07080d 85%)',
    },
    particleCount: 110,
    particleSpeed: 2.2,
    pulseScale: 1.25,
    description: 'Electric neon lines, high velocity pulses, and heavy bass reactive bursts.',
  },
  Dark: {
    type: 'Dark',
    label: 'Dark & Mysterious',
    colors: {
      primary: '#9333ea', // Purple 600
      secondary: '#dc2626', // Red 600
      accent: '#7c3aed', // Violet 600
      glow: 'rgba(147, 51, 234, 0.4)',
      bgGradient: 'radial-gradient(ellipse at top, rgba(147, 51, 234, 0.22) 0%, rgba(220, 38, 38, 0.12) 55%, #050608 90%)',
    },
    particleCount: 45,
    particleSpeed: 0.8,
    pulseScale: 1.15,
    description: 'Obsidian depths, blood violet auras, and brooding sub-bass presence.',
  },
  Dreamy: {
    type: 'Dreamy',
    label: 'Dreamy & Ethereal',
    colors: {
      primary: '#8b5cf6', // Violet 500
      secondary: '#38bdf8', // Light Blue 400
      accent: '#c084fc', // Purple 400
      glow: 'rgba(139, 92, 246, 0.42)',
      bgGradient: 'radial-gradient(ellipse at top, rgba(139, 92, 246, 0.22) 0%, rgba(56, 189, 248, 0.15) 50%, #07080d 85%)',
    },
    particleCount: 65,
    particleSpeed: 0.65,
    pulseScale: 1.1,
    description: 'Lavender nebula mist, iridescent floating stars, and atmospheric reverie.',
  },
  Nostalgic: {
    type: 'Nostalgic',
    label: 'Nostalgic & Vintage',
    colors: {
      primary: '#d97706', // Amber 600
      secondary: '#b45309', // Amber 700
      accent: '#fef08a', // Yellow 200
      glow: 'rgba(217, 119, 6, 0.4)',
      bgGradient: 'radial-gradient(ellipse at top, rgba(217, 119, 6, 0.22) 0%, rgba(180, 83, 9, 0.14) 50%, #07080d 85%)',
    },
    particleCount: 50,
    particleSpeed: 0.75,
    pulseScale: 1.08,
    description: 'Sepia warmth, vinyl haze, memory reflections, and golden hour reverbs.',
  },
  Cinematic: {
    type: 'Cinematic',
    label: 'Cinematic & Epic',
    colors: {
      primary: '#e11d48', // Rose 600
      secondary: '#2563eb', // Blue 600
      accent: '#f59e0b', // Amber 500
      glow: 'rgba(225, 29, 72, 0.45)',
      bgGradient: 'radial-gradient(ellipse at top, rgba(225, 29, 72, 0.22) 0%, rgba(37, 99, 235, 0.15) 55%, #05050a 90%)',
    },
    particleCount: 85,
    particleSpeed: 1.2,
    pulseScale: 1.22,
    description: 'Orchestral grandeur, anamorphic beams, sweeping drama, and thunderous dynamics.',
  },
  Focus: {
    type: 'Focus',
    label: 'Deep Focus & Flow',
    colors: {
      primary: '#10b981', // Emerald 500
      secondary: '#0ea5e9', // Sky 500
      accent: '#6ee7b7', // Emerald 300
      glow: 'rgba(16, 185, 129, 0.35)',
      bgGradient: 'radial-gradient(ellipse at top, rgba(16, 185, 129, 0.18) 0%, rgba(14, 165, 233, 0.12) 50%, #06070a 90%)',
    },
    particleCount: 40,
    particleSpeed: 0.5,
    pulseScale: 1.04,
    description: 'Minimalist clarity, steady pulse rhythms, and distraction-free sonic sanctuary.',
  },
};

const KEYWORD_MAP: Record<MoodType, string[]> = {
  Happy: ['sun', 'shine', 'dance', 'smile', 'joy', 'bright', 'celebrate', 'laugh', 'good', 'golden', 'high'],
  Sad: ['tear', 'cry', 'alone', 'broken', 'sorrow', 'miss', 'darkness', 'cold', 'pain', 'fade', 'gone'],
  Romantic: ['love', 'kiss', 'heart', 'forever', 'darling', 'touch', 'hold', 'embrace', 'sweet', 'soft'],
  Calm: ['peace', 'breathe', 'ocean', 'quiet', 'gentle', 'still', 'rest', 'wave', 'drift', 'soothe'],
  Energetic: ['fire', 'jump', 'electric', 'power', 'beat', 'lightning', 'wild', 'run', 'ignite', 'pulse'],
  Dark: ['shadow', 'night', 'black', 'blood', 'abyss', 'demon', 'poison', 'curse', 'grave', 'storm'],
  Dreamy: ['dream', 'cloud', 'fly', 'star', 'space', 'floating', 'magic', 'sky', 'wonder', 'sleep'],
  Nostalgic: ['remember', 'yesterday', 'memory', 'time', 'past', 'retro', 'child', 'old', 'rewind', 'years'],
  Cinematic: ['hero', 'world', 'destiny', 'glory', 'battle', 'horizon', 'skyfall', 'rise', 'conquer', 'epic'],
  Focus: ['mind', 'study', 'flow', 'deep', 'code', 'steady', 'vision', 'learn', 'horizon', 'clarity'],
};

/**
 * Estimates mood from audio features and lyric text
 */
export function estimateMood(
  features?: Partial<AudioFeatures>,
  lyricSnippet?: string,
  bpm?: number
): { mood: MoodType; confidence: number } {
  const scores: Record<MoodType, number> = {
    Happy: 0.1,
    Sad: 0.1,
    Romantic: 0.1,
    Calm: 0.1,
    Energetic: 0.1,
    Dark: 0.1,
    Dreamy: 0.1,
    Nostalgic: 0.1,
    Cinematic: 0.1,
    Focus: 0.1,
  };

  const energy = features?.energy ?? 0.5;
  const bass = features?.bass ?? 0.5;
  const treble = features?.treble ?? 0.5;
  const tempo = bpm ?? features?.bpmEstimate ?? 120;

  // Tempo + Energy heuristics
  if (tempo > 130 && energy > 0.65) {
    scores.Energetic += 0.5;
    scores.Happy += 0.3;
  } else if (tempo < 90 && energy < 0.4) {
    scores.Calm += 0.4;
    scores.Sad += 0.35;
    scores.Focus += 0.25;
  } else if (tempo >= 90 && tempo <= 125) {
    scores.Dreamy += 0.3;
    scores.Romantic += 0.3;
    scores.Nostalgic += 0.25;
  }

  // Bass + Treble heuristics
  if (bass > 0.7 && energy > 0.6) {
    scores.Dark += 0.35;
    scores.Energetic += 0.3;
  }
  if (treble > 0.6 && energy > 0.5) {
    scores.Happy += 0.3;
    scores.Dreamy += 0.25;
  }
  if (bass > 0.6 && energy < 0.5) {
    scores.Cinematic += 0.35;
  }

  // Lyrics keyword matching
  if (lyricSnippet) {
    const lower = lyricSnippet.toLowerCase();
    for (const [moodKey, words] of Object.entries(KEYWORD_MAP)) {
      for (const word of words) {
        if (lower.includes(word)) {
          scores[moodKey as MoodType] += 0.45;
        }
      }
    }
  }

  // Find max mood
  let bestMood: MoodType = 'Energetic';
  let maxScore = -1;
  let totalScore = 0;

  for (const [m, score] of Object.entries(scores)) {
    totalScore += score;
    if (score > maxScore) {
      maxScore = score;
      bestMood = m as MoodType;
    }
  }

  // Confidence estimation (range 55% - 98%)
  const relativeRatio = totalScore > 0 ? maxScore / totalScore : 0.3;
  const confidence = Math.min(98, Math.max(55, Math.round(relativeRatio * 220)));

  return { mood: bestMood, confidence };
}
