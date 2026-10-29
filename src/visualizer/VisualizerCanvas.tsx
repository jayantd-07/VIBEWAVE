import React, { useEffect, useRef } from 'react';
import { audioEngine } from '../audio/audioEngine';
import { VisualizerMode, MoodType } from '../types';
import { MOOD_CONFIGS } from '../utils/moodClassifier';

interface VisualizerCanvasProps {
  mode: VisualizerMode;
  currentMood: MoodType;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  baseAlpha: number;
}

export const VisualizerCanvas: React.FC<VisualizerCanvasProps> = ({
  mode,
  currentMood,
  isFullscreen,
  onToggleFullscreen,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // References to avoid re-renders inside 60fps loop
  const modeRef = useRef(mode);
  const moodRef = useRef(currentMood);
  const particlesRef = useRef<Particle[]>([]);
  const beatPulseRef = useRef<number>(1.0);
  const rotationAngleRef = useRef<number>(0);
  const peakValuesRef = useRef<number[]>(new Array(64).fill(0));

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    moodRef.current = currentMood;
    // Re-seed particles with mood palette
    initParticles();
  }, [currentMood]);

  const initParticles = () => {
    const config = MOOD_CONFIGS[moodRef.current] || MOOD_CONFIGS.Energetic;
    const count = config.particleCount || 60;
    const list: Particle[] = [];
    const colors = [config.colors.primary, config.colors.secondary, config.colors.accent];

    for (let i = 0; i < count; i++) {
      list.push({
        x: Math.random() * 1000,
        y: Math.random() * 600,
        vx: (Math.random() - 0.5) * config.particleSpeed * 1.5,
        vy: (Math.random() - 0.5) * config.particleSpeed * 1.5,
        size: Math.random() * 3.5 + 1.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.6 + 0.2,
        baseAlpha: Math.random() * 0.6 + 0.2,
      });
    }
    particlesRef.current = list;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    initParticles();

    // Resize handler
    const updateCanvasSize = () => {
      const container = containerRef.current;
      if (!container || !canvas) return;
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      // re-bound particles
      particlesRef.current.forEach((p) => {
        p.x = Math.random() * canvas.width;
        p.y = Math.random() * canvas.height;
      });
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Main 60 FPS Render Loop
    const ctx2d = canvas.getContext('2d');
    if (!ctx2d) return;

    let lastTime = performance.now();

    const render = (time: number) => {
      animFrameRef.current = requestAnimationFrame(render);
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      const width = canvas.width;
      const height = canvas.height;
      if (width === 0 || height === 0) return;

      // Extract Audio Features
      const features = audioEngine.getAudioFeatures();
      const freqData = audioEngine.getFrequencyData();
      const timeData = audioEngine.getTimeDomainData();

      // Smooth beat pulse decay
      if (features.isBeat) {
        beatPulseRef.current = 1.35;
      } else {
        beatPulseRef.current += (1.0 - beatPulseRef.current) * 0.08;
      }

      rotationAngleRef.current += 0.005 + features.energy * 0.015;

      const activeMood = moodRef.current;
      const moodConfig = MOOD_CONFIGS[activeMood] || MOOD_CONFIGS.Energetic;
      const effectiveMode =
        modeRef.current === 'auto' ? getAutoModeForMood(activeMood) : modeRef.current;

      // Clear with slight motion blur trail
      ctx2d.save();
      ctx2d.fillStyle = 'rgba(7, 8, 13, 0.28)';
      ctx2d.fillRect(0, 0, width, height);

      // Render based on visualizer mode
      switch (effectiveMode) {
        case 'spectrum':
          drawAudioSpectrum(ctx2d, width, height, freqData, moodConfig, features);
          break;
        case 'waves':
          drawFluidWaves(ctx2d, width, height, timeData, moodConfig, features, time);
          break;
        case 'particles':
          drawParticleUniverse(ctx2d, width, height, moodConfig, features, dt);
          break;
        case 'neon':
          drawNeonPulse(ctx2d, width, height, freqData, moodConfig, features);
          break;
        case 'cinematic':
          drawCinematicAtmosphere(ctx2d, width, height, moodConfig, features, time);
          break;
        case 'ambient':
          drawMinimalAmbient(ctx2d, width, height, moodConfig, features, time);
          break;
        case 'lyrics':
          drawLyricsFocusAura(ctx2d, width, height, moodConfig, features, time);
          break;
        default:
          drawNeonPulse(ctx2d, width, height, freqData, moodConfig, features);
          break;
      }

      // Draw floating audio particles layer across all modes for immersive depth
      drawAmbientDust(ctx2d, width, height, moodConfig, features);

      ctx2d.restore();
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, []);

  // Map Mood to optimal visualization style in 'auto' mode
  const getAutoModeForMood = (mood: MoodType): VisualizerMode => {
    switch (mood) {
      case 'Energetic':
        return 'neon';
      case 'Happy':
        return 'spectrum';
      case 'Sad':
        return 'waves';
      case 'Romantic':
        return 'waves';
      case 'Calm':
        return 'ambient';
      case 'Dark':
        return 'neon';
      case 'Dreamy':
        return 'particles';
      case 'Nostalgic':
        return 'waves';
      case 'Cinematic':
        return 'cinematic';
      case 'Focus':
        return 'ambient';
      default:
        return 'neon';
    }
  };

  // 1. Audio Spectrum (Mirrored Neon Bars with Peak Caps)
  const drawAudioSpectrum = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    freq: Uint8Array,
    config: typeof MOOD_CONFIGS.Energetic,
    features: any
  ) => {
    const bars = 48;
    const barWidth = (w / bars) * 0.75;
    const gap = (w / bars) * 0.25;
    const centerY = h * 0.65;
    const step = Math.floor(freq.length / (bars * 1.5));

    for (let i = 0; i < bars; i++) {
      const val = (freq[i * step] || 0) / 255;
      const barHeight = Math.max(4, val * h * 0.48 * beatPulseRef.current);

      // Peak decay tracker
      if (barHeight > (peakValuesRef.current[i] || 0)) {
        peakValuesRef.current[i] = barHeight;
      } else {
        peakValuesRef.current[i] = Math.max(0, (peakValuesRef.current[i] || 0) - 1.8);
      }

      const x = i * (barWidth + gap) + gap / 2;

      // Gradient fill
      const grad = ctx.createLinearGradient(x, centerY - barHeight, x, centerY);
      grad.addColorStop(0, config.colors.secondary);
      grad.addColorStop(0.6, config.colors.primary);
      grad.addColorStop(1, 'rgba(6, 182, 212, 0.15)');

      ctx.fillStyle = grad;
      ctx.shadowColor = config.colors.glow;
      ctx.shadowBlur = features.isBeat ? 16 : 8;

      // Upward Bar
      ctx.beginPath();
      ctx.roundRect(x, centerY - barHeight, barWidth, barHeight, [4, 4, 0, 0]);
      ctx.fill();

      // Mirrored Reflection (fade downward)
      const reflectGrad = ctx.createLinearGradient(x, centerY, x, centerY + barHeight * 0.45);
      reflectGrad.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
      reflectGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = reflectGrad;
      ctx.beginPath();
      ctx.roundRect(x, centerY + 3, barWidth, barHeight * 0.45, [0, 0, 4, 4]);
      ctx.fill();

      // Peak floating cap
      ctx.fillStyle = config.colors.accent;
      const peakY = centerY - (peakValuesRef.current[i] || 0) - 4;
      ctx.fillRect(x, peakY, barWidth, 2);
    }
  };

  // 2. Fluid Waves (Harmonic Spline Ribbons)
  const drawFluidWaves = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    timeData: Uint8Array,
    config: typeof MOOD_CONFIGS.Energetic,
    features: any,
    time: number
  ) => {
    const layers = 3;
    const centerY = h * 0.55;

    for (let l = 0; l < layers; l++) {
      ctx.beginPath();
      ctx.moveTo(0, centerY);

      const amp = (features.energy * 90 + features.bass * 70 + 20) * (1 - l * 0.2);
      const freqMult = 0.003 + l * 0.002;
      const speed = time * 0.0015 * (l + 1);

      for (let x = 0; x <= w; x += 12) {
        const timeIndex = Math.floor((x / w) * timeData.length);
        const audioOffset = ((timeData[timeIndex] || 128) - 128) * 0.8;
        const wave = Math.sin(x * freqMult + speed) * amp + audioOffset;
        ctx.lineTo(x, centerY + wave + l * 20);
      }

      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();

      const alpha = 0.18 - l * 0.04;
      const grad = ctx.createLinearGradient(0, centerY - amp, 0, h);
      grad.addColorStop(0, l === 0 ? config.colors.primary : config.colors.secondary);
      grad.addColorStop(1, 'rgba(7, 8, 13, 0.05)');

      ctx.fillStyle = grad;
      ctx.globalAlpha = alpha + features.bass * 0.15;
      ctx.fill();
      ctx.globalAlpha = 1;

      // Glowing Crest Line
      ctx.strokeStyle = l === 0 ? config.colors.accent : config.colors.primary;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = config.colors.glow;
      ctx.shadowBlur = 12;
      ctx.stroke();
    }
  };

  // 3. Particle Universe (Orbital Gravity Well & Drop Explosions)
  const drawParticleUniverse = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    config: typeof MOOD_CONFIGS.Energetic,
    features: any,
    dt: number
  ) => {
    const cx = w / 2;
    const cy = h / 2;
    const particles = particlesRef.current;

    // Center pulsating core
    const coreRadius = (35 + features.bass * 45) * beatPulseRef.current;
    const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreRadius * 2);
    coreGrad.addColorStop(0, config.colors.primary);
    coreGrad.addColorStop(0.5, config.colors.glow);
    coreGrad.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, coreRadius * 2, 0, Math.PI * 2);
    ctx.fill();

    particles.forEach((p) => {
      // Gravitational attraction towards center with orbital swirl
      const dx = cx - p.x;
      const dy = cy - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;

      // On beat, explode outward!
      if (features.isBeat) {
        const angle = Math.atan2(p.y - cy, p.x - cx);
        p.vx += Math.cos(angle) * (features.bass * 8 + 3);
        p.vy += Math.sin(angle) * (features.bass * 8 + 3);
      }

      // Orbital swirl
      p.vx += (-dy / dist) * 0.15 + (dx / dist) * 0.08;
      p.vy += (dx / dist) * 0.15 + (dy / dist) * 0.08;

      // Friction
      p.vx *= 0.96;
      p.vy *= 0.96;

      p.x += p.vx;
      p.y += p.vy;

      // Boundary loop
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;

      // Render particle
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.globalAlpha = Math.min(1, p.alpha + features.energy * 0.4);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (1 + features.treble * 1.5), 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  };

  // 4. Neon Pulse (Concentric Radial Rings & Circular Spectrum)
  const drawNeonPulse = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    freq: Uint8Array,
    config: typeof MOOD_CONFIGS.Energetic,
    features: any
  ) => {
    const cx = w / 2;
    const cy = h / 2;
    const baseRadius = Math.min(w, h) * 0.22 * beatPulseRef.current;
    const barsCount = 64;
    const angleStep = (Math.PI * 2) / barsCount;

    // Glowing Inner Disc
    const innerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseRadius);
    innerGrad.addColorStop(0, 'rgba(6, 182, 212, 0.2)');
    innerGrad.addColorStop(0.7, config.colors.glow);
    innerGrad.addColorStop(1, 'rgba(0,0,0,0.1)');
    ctx.fillStyle = innerGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
    ctx.fill();

    // Radial Audio Bars
    ctx.shadowColor = config.colors.glow;
    ctx.shadowBlur = features.isBeat ? 20 : 10;

    for (let i = 0; i < barsCount; i++) {
      const angle = i * angleStep + rotationAngleRef.current;
      const val = (freq[i * 4] || 0) / 255;
      const barLen = Math.max(6, val * 95 * beatPulseRef.current);

      const x1 = cx + Math.cos(angle) * baseRadius;
      const y1 = cy + Math.sin(angle) * baseRadius;
      const x2 = cx + Math.cos(angle) * (baseRadius + barLen);
      const y2 = cy + Math.sin(angle) * (baseRadius + barLen);

      ctx.strokeStyle = i % 2 === 0 ? config.colors.primary : config.colors.secondary;
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // Outer glowing bead
      if (val > 0.4) {
        ctx.fillStyle = config.colors.accent;
        ctx.beginPath();
        ctx.arc(x2, y2, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Outer Concentric Shockwave Ring on Beat
    const shockRadius = baseRadius + (1.0 - (beatPulseRef.current - 1.0)) * 60;
    ctx.strokeStyle = config.colors.accent;
    ctx.lineWidth = 2;
    ctx.globalAlpha = Math.max(0, (beatPulseRef.current - 1.0) * 2.5);
    ctx.beginPath();
    ctx.arc(cx, cy, shockRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  };

  // 5. Cinematic Atmosphere (Anamorphic Beams & Volumetric Fog)
  const drawCinematicAtmosphere = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    config: typeof MOOD_CONFIGS.Energetic,
    features: any,
    time: number
  ) => {
    const cx = w / 2;
    const cy = h / 2;

    // Horizontal Anamorphic Flare
    const flareH = (12 + features.bass * 30) * beatPulseRef.current;
    const flareGrad = ctx.createLinearGradient(0, cy, w, cy);
    flareGrad.addColorStop(0, 'rgba(0,0,0,0)');
    flareGrad.addColorStop(0.2, config.colors.glow);
    flareGrad.addColorStop(0.5, '#ffffff');
    flareGrad.addColorStop(0.8, config.colors.glow);
    flareGrad.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = flareGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.48, flareH, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dual Dramatic Light Beams
    const beamCount = 6;
    for (let b = 0; b < beamCount; b++) {
      const angle = (b / beamCount) * Math.PI + Math.sin(time * 0.0008 + b) * 0.3;
      const beamLen = Math.max(w, h) * 0.9;
      const bx = cx + Math.cos(angle) * beamLen;
      const by = cy + Math.sin(angle) * beamLen;

      const beamGrad = ctx.createLinearGradient(cx, cy, bx, by);
      beamGrad.addColorStop(0, config.colors.primary);
      beamGrad.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.strokeStyle = beamGrad;
      ctx.lineWidth = (15 + features.mid * 40) * (b % 2 === 0 ? 1 : 0.6);
      ctx.globalAlpha = 0.22 + features.energy * 0.25;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(bx, by);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  };

  // 6. Minimal Ambient (Zen-like Breathing Geometry)
  const drawMinimalAmbient = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    config: typeof MOOD_CONFIGS.Energetic,
    features: any,
    time: number
  ) => {
    const cx = w / 2;
    const cy = h / 2;
    const breath = Math.sin(time * 0.002) * 15;
    const radius = Math.min(w, h) * 0.25 + breath + features.bass * 25;

    // Soft Ambient Glow
    const glowGrad = ctx.createRadialGradient(cx, cy, radius * 0.3, cx, cy, radius * 1.5);
    glowGrad.addColorStop(0, config.colors.primary);
    glowGrad.addColorStop(0.7, config.colors.glow);
    glowGrad.addColorStop(1, 'rgba(7, 8, 13, 0)');

    ctx.fillStyle = glowGrad;
    ctx.globalAlpha = 0.45;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Clean Minimalist Ring
    ctx.strokeStyle = config.colors.accent;
    ctx.lineWidth = 2.5;
    ctx.globalAlpha = 0.85;
    ctx.shadowColor = config.colors.glow;
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Orbiting Satellite Node
    const orbAngle = time * 0.001;
    const orbX = cx + Math.cos(orbAngle) * radius;
    const orbY = cy + Math.sin(orbAngle) * radius;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(orbX, orbY, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;
  };

  // 7. Lyrics Focus Aura (Soft stage ambient backdrop)
  const drawLyricsFocusAura = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    config: typeof MOOD_CONFIGS.Energetic,
    features: any,
    time: number
  ) => {
    const cx = w / 2;
    const cy = h * 0.45;
    const radius = Math.min(w, h) * 0.4 * (1 + features.energy * 0.3);

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    grad.addColorStop(0, config.colors.primary);
    grad.addColorStop(0.4, config.colors.glow);
    grad.addColorStop(1, 'rgba(7,8,13,0)');

    ctx.fillStyle = grad;
    ctx.globalAlpha = 0.35 + features.bass * 0.15;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  };

  // Ambient Dust Particles floating gently
  const drawAmbientDust = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    config: typeof MOOD_CONFIGS.Energetic,
    features: any
  ) => {
    const particles = particlesRef.current.slice(0, 30);
    particles.forEach((p) => {
      ctx.fillStyle = config.colors.accent;
      ctx.globalAlpha = p.baseAlpha * (0.4 + features.treble * 0.6);
      ctx.beginPath();
      ctx.arc(p.x % w, p.y % h, p.size * 0.8, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden select-none bg-black/40 rounded-2xl ${className}`}
    >
      <canvas
        ref={canvasRef}
        data-testid="vibewave-visualizer-canvas"
        className="w-full h-full block"
      />

      {/* Floating Exit Fullscreen Badge when in Fullscreen Mode */}
      {isFullscreen && onToggleFullscreen && (
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          <button
            onClick={onToggleFullscreen}
            aria-label="Exit Fullscreen"
            className="px-3 py-1.5 rounded-lg bg-black/60 hover:bg-white/10 border border-white/20 text-xs font-mono text-slate-300 backdrop-blur-md transition-all flex items-center gap-1.5 cursor-pointer shadow-lg hover:border-cyan-500/50"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            Exit Fullscreen
          </button>
        </div>
      )}
    </div>
  );
};
