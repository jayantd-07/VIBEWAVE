import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Mic2,
  Sliders,
  Maximize2,
  Minimize2,
  Sparkles,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { Track, MoodType, VisualizerMode } from '../types';
import { formatTime } from '../utils/lrcParser';
import { MOOD_CONFIGS } from '../utils/moodClassifier';

interface PlayerBarProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  currentMood: MoodType;
  moodConfidence: number;
  visualizerMode: VisualizerMode;
  showLyrics: boolean;
  isFullscreen: boolean;
  onPlayPause: () => void;
  onSeek: (seconds: number) => void;
  onPrev: () => void;
  onNext: () => void;
  onToggleShuffle: () => void;
  onCycleRepeat: () => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onSelectMood: (mood: MoodType) => void;
  onSelectVisualizerMode: (mode: VisualizerMode) => void;
  onToggleLyrics: () => void;
  onOpenEqualizer: () => void;
  onToggleFullscreen: () => void;
}

export const PlayerBar: React.FC<PlayerBarProps> = ({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isShuffle,
  repeatMode,
  currentMood,
  moodConfidence,
  visualizerMode,
  showLyrics,
  isFullscreen,
  onPlayPause,
  onSeek,
  onPrev,
  onNext,
  onToggleShuffle,
  onCycleRepeat,
  onVolumeChange,
  onToggleMute,
  onSelectMood,
  onSelectVisualizerMode,
  onToggleLyrics,
  onOpenEqualizer,
  onToggleFullscreen,
}) => {
  const [showMoodMenu, setShowMoodMenu] = useState(false);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  const moodConfig = MOOD_CONFIGS[currentMood] || MOOD_CONFIGS.Energetic;
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      {/* =========================================================================
          1. MOBILE COMPACT FLOATING MINI-PLAYER (Visible on mobile < md screens)
          Floats right above the bottom navigation bar (bottom-16)
         ========================================================================= */}
      {currentTrack && (
        <div
          className="md:hidden fixed bottom-16 inset-x-2 h-14 bg-[#101320]/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl z-30 flex flex-col overflow-hidden transition-all duration-300"
          style={{
            boxShadow: `0 4px 20px -2px ${moodConfig.colors.glow}44`,
          }}
        >
          {/* Progress bar at the very top of mini-player */}
          <div className="w-full h-1 bg-white/10 relative">
            <div
              className="h-full transition-all duration-100"
              style={{
                width: `${progressPercent}%`,
                background: `linear-gradient(90deg, ${moodConfig.colors.primary}, ${moodConfig.colors.secondary})`,
              }}
            />
          </div>

          {/* Mini-player content: Cover, Title, Play/Pause, Next */}
          <div className="flex-1 flex items-center justify-between px-3 gap-2">
            <div
              onClick={() => setIsMobileExpanded(true)}
              className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer py-1"
            >
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-9 h-9 rounded-xl object-cover border border-white/10 shadow-md flex-shrink-0"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-white truncate">
                  {currentTrack.title}
                </span>
                <span className="text-[10px] text-slate-400 truncate">
                  {currentTrack.artist} • <span style={{ color: moodConfig.colors.accent }}>{currentMood}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPlayPause();
                }}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                className="w-9 h-9 rounded-full flex items-center justify-center text-white cursor-pointer active:scale-95 transition-transform shadow-md"
                style={{
                  background: `linear-gradient(135deg, ${moodConfig.colors.primary}, ${moodConfig.colors.secondary})`,
                }}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-white text-white" />
                ) : (
                  <Play className="w-4 h-4 fill-white text-white translate-x-0.5" />
                )}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNext();
                }}
                aria-label="Next track"
                className="p-2 text-slate-300 hover:text-white cursor-pointer active:scale-95"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          2. MOBILE FULL-SCREEN EXPANDED NOW-PLAYING SHEET
          Opens when user taps on the mini-player for full native player experience
         ========================================================================= */}
      {isMobileExpanded && currentTrack && (
        <div
          className="md:hidden fixed inset-0 z-50 flex flex-col justify-between p-6 select-none animate-in slide-in-from-bottom duration-300 backdrop-blur-3xl overflow-y-auto"
          style={{
            background: `radial-gradient(circle at 50% 20%, ${moodConfig.colors.primary}33 0%, #070911 85%)`,
          }}
        >
          {/* Header: Minimize Chevron + Title + Mood Pill */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setIsMobileExpanded(false)}
              className="p-2.5 rounded-full bg-white/5 border border-white/10 text-white cursor-pointer active:scale-95"
              aria-label="Close full player"
            >
              <ChevronDown className="w-6 h-6" />
            </button>

            <div className="flex flex-col items-center">
              <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
                NOW PLAYING
              </span>
              <span className="text-xs font-semibold text-slate-200">
                {currentTrack.genre || 'Hi-Fi Audio'}
              </span>
            </div>

            <div
              className="px-2.5 py-1 rounded-full text-[10px] font-bold border border-white/10 flex items-center gap-1 shadow-md"
              style={{
                backgroundColor: `${moodConfig.colors.primary}33`,
                color: moodConfig.colors.accent,
              }}
            >
              <Sparkles className="w-3 h-3" />
              <span>{currentMood}</span>
            </div>
          </div>

          {/* Large Album Artwork */}
          <div className="my-auto flex flex-col items-center px-4 py-6">
            <div
              className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl overflow-hidden shadow-2xl border-2 border-white/15"
              style={{
                boxShadow: `0 15px 50px -10px ${moodConfig.colors.glow}77`,
              }}
            >
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className={`w-full h-full object-cover transition-transform duration-700 ${
                  isPlaying ? 'scale-105' : 'scale-100'
                }`}
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  boxShadow: `inset 0 0 40px ${moodConfig.colors.primary}44`,
                }}
              />
            </div>

            {/* Title & Artist & Badges */}
            <div className="w-full mt-6 text-center">
              <h2 className="text-xl sm:text-2xl font-black text-white truncate drop-shadow-md">
                {currentTrack.title}
              </h2>
              <p className="text-sm font-medium text-slate-400 mt-1 truncate">
                {currentTrack.artist}
              </p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/10 text-cyan-300 border border-white/10">
                  {currentTrack.format || 'Hi-Fi FLAC'}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {currentTrack.bpm || 120} BPM
                </span>
              </div>
            </div>
          </div>

          {/* Progress Slider + Timestamps */}
          <div className="w-full flex flex-col gap-1.5 mb-2">
            <div className="relative w-full py-2 cursor-pointer">
              <div className="relative h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-100"
                  style={{
                    width: `${progressPercent}%`,
                    background: `linear-gradient(90deg, ${moodConfig.colors.primary}, ${moodConfig.colors.secondary})`,
                    boxShadow: `0 0 10px ${moodConfig.colors.glow}`,
                  }}
                />
              </div>
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.1}
                value={currentTime}
                onChange={(e) => onSeek(parseFloat(e.target.value))}
                aria-label="Track progress slider"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Large Mobile Playback Controls */}
          <div className="flex items-center justify-between px-2 mb-4">
            <button
              onClick={onToggleShuffle}
              aria-label="Toggle shuffle"
              className={`p-3 rounded-full transition-all ${
                isShuffle ? 'text-cyan-400 bg-cyan-500/20' : 'text-slate-400'
              }`}
            >
              <Shuffle className="w-5 h-5" />
            </button>

            <button
              onClick={onPrev}
              aria-label="Previous track"
              className="p-3 text-white transition-all active:scale-90"
            >
              <SkipBack className="w-7 h-7 fill-white" />
            </button>

            <button
              onClick={onPlayPause}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="w-18 h-18 rounded-full flex items-center justify-center text-white transition-all active:scale-95 shadow-2xl"
              style={{
                background: `linear-gradient(135deg, ${moodConfig.colors.primary}, ${moodConfig.colors.secondary})`,
                boxShadow: `0 0 30px ${moodConfig.colors.glow}`,
              }}
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 fill-white text-white" />
              ) : (
                <Play className="w-8 h-8 fill-white text-white translate-x-1" />
              )}
            </button>

            <button
              onClick={onNext}
              aria-label="Next track"
              className="p-3 text-white transition-all active:scale-90"
            >
              <SkipForward className="w-7 h-7 fill-white" />
            </button>

            <button
              onClick={onCycleRepeat}
              aria-label="Cycle repeat"
              className={`p-3 rounded-full transition-all ${
                repeatMode !== 'off' ? 'text-cyan-400 bg-cyan-500/20' : 'text-slate-400'
              }`}
            >
              {repeatMode === 'one' ? (
                <Repeat1 className="w-5 h-5" />
              ) : (
                <Repeat className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Quick Action Footer in Expanded Sheet: Lyrics, EQ, Fullscreen Visualizer */}
          <div className="flex items-center justify-around pt-3 border-t border-white/10">
            <button
              onClick={() => {
                onToggleLyrics();
                setIsMobileExpanded(false);
              }}
              className={`flex flex-col items-center gap-1 text-xs py-1 px-3 rounded-xl transition-all ${
                showLyrics ? 'text-cyan-400 font-bold' : 'text-slate-400'
              }`}
            >
              <Mic2 className="w-5 h-5" />
              <span className="text-[10px]">Lyrics</span>
            </button>

            <button
              onClick={() => {
                onOpenEqualizer();
                setIsMobileExpanded(false);
              }}
              className="flex flex-col items-center gap-1 text-xs py-1 px-3 rounded-xl text-emerald-400"
            >
              <Sliders className="w-5 h-5" />
              <span className="text-[10px]">10-Band EQ</span>
            </button>

            <button
              onClick={() => {
                onToggleFullscreen();
                setIsMobileExpanded(false);
              }}
              className="flex flex-col items-center gap-1 text-xs py-1 px-3 rounded-xl text-violet-400"
            >
              <Maximize2 className="w-5 h-5" />
              <span className="text-[10px]">Visualizer</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          3. DESKTOP FIXED FOOTER PLAYER BAR (Visible on md+ screens)
         ========================================================================= */}
      <footer className="hidden md:flex h-24 bg-[#0a0c13]/95 backdrop-blur-2xl border-t border-white/5 px-6 items-center justify-between select-none z-30 relative">
        {/* Track Info (Left) */}
        <div className="flex items-center gap-4 w-1/4 min-w-[220px]">
          {currentTrack ? (
            <>
              <div className="relative group">
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  className="w-14 h-14 rounded-xl object-cover shadow-lg border border-white/10 group-hover:scale-105 transition-transform"
                />
                <div
                  className="absolute inset-0 rounded-xl opacity-30 pointer-events-none transition-all duration-500"
                  style={{
                    boxShadow: isPlaying ? `0 0 20px ${moodConfig.colors.primary}` : 'none',
                  }}
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-white truncate hover:underline cursor-pointer">
                  {currentTrack.title}
                </span>
                <span className="text-xs text-slate-400 truncate">{currentTrack.artist}</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/10 text-cyan-300 border border-white/10">
                    {currentTrack.format || 'Hi-Fi FLAC'}
                  </span>
                  <span className="text-[9px] font-mono text-slate-500">
                    {currentTrack.sampleRate || '96kHz'}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center">
                <span className="text-slate-500 text-xs">Offline</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-300">Ready to play</span>
                <span className="text-xs text-slate-500">Select a track</span>
              </div>
            </div>
          )}
        </div>

        {/* Main Playback & Timeline Controls (Center) */}
        <div className="flex flex-col items-center gap-2 w-2/4 max-w-2xl px-4">
          <div className="flex items-center gap-5">
            <button
              onClick={onToggleShuffle}
              aria-label="Toggle shuffle"
              className={`p-2 rounded-full transition-all cursor-pointer ${
                isShuffle ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              onClick={onPrev}
              aria-label="Previous track"
              className="p-2 text-slate-300 hover:text-white transition-all cursor-pointer hover:scale-110 active:scale-95"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={onPlayPause}
              aria-label={isPlaying ? 'Pause music' : 'Play music'}
              className="w-12 h-12 rounded-full flex items-center justify-center text-white transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-xl"
              style={{
                background: `linear-gradient(135deg, ${moodConfig.colors.primary}, ${moodConfig.colors.secondary})`,
                boxShadow: `0 0 20px ${moodConfig.colors.glow}`,
              }}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 fill-white text-white" />
              ) : (
                <Play className="w-6 h-6 fill-white text-white translate-x-0.5" />
              )}
            </button>

            <button
              onClick={onNext}
              aria-label="Next track"
              className="p-2 text-slate-300 hover:text-white transition-all cursor-pointer hover:scale-110 active:scale-95"
            >
              <SkipForward className="w-5 h-5" />
            </button>

            <button
              onClick={onCycleRepeat}
              aria-label="Cycle repeat mode"
              className={`p-2 rounded-full transition-all cursor-pointer ${
                repeatMode !== 'off'
                  ? 'text-cyan-400 bg-cyan-500/10'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {repeatMode === 'one' ? (
                <Repeat1 className="w-4 h-4" />
              ) : (
                <Repeat className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Scrubber with Section Markers */}
          <div className="w-full flex items-center gap-3">
            <span className="text-[11px] font-mono text-slate-400 min-w-[34px] text-right">
              {formatTime(currentTime)}
            </span>

            <div className="relative flex-1 group py-2 cursor-pointer">
              {currentTrack?.sections && duration > 0 && (
                <div className="absolute inset-x-0 top-0 h-1 flex pointer-events-none">
                  {currentTrack.sections.map((sec, idx) => {
                    const left = (sec.startTime / duration) * 100;
                    const width = ((sec.endTime - sec.startTime) / duration) * 100;
                    return (
                      <div
                        key={idx}
                        style={{ left: `${left}%`, width: `${width}%` }}
                        className="absolute top-0 h-1 border-r border-black/40 bg-white/10"
                        title={`${sec.label || sec.type} (${formatTime(sec.startTime)})`}
                      />
                    );
                  })}
                </div>
              )}

              <div className="relative h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-100"
                  style={{
                    width: `${progressPercent}%`,
                    background: `linear-gradient(90deg, ${moodConfig.colors.primary}, ${moodConfig.colors.secondary})`,
                    boxShadow: `0 0 10px ${moodConfig.colors.glow}`,
                  }}
                />
              </div>

              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.1}
                value={currentTime}
                onChange={(e) => onSeek(parseFloat(e.target.value))}
                aria-label="Track progress slider"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>

            <span className="text-[11px] font-mono text-slate-400 min-w-[34px]">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Mood, Visualizer & Audio Controls (Right) */}
        <div className="flex items-center justify-end gap-3 w-1/4 min-w-[280px]">
          {/* Mood Pill & Override Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMoodMenu(!showMoodMenu)}
              aria-label="Select mood"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 transition-all cursor-pointer text-xs font-medium text-slate-200"
            >
              <span
                className="w-2 h-2 rounded-full animate-ping"
                style={{ backgroundColor: moodConfig.colors.primary }}
              />
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentMood}</span>
              <span className="text-[10px] font-mono text-slate-400">({moodConfidence}%)</span>
              <ChevronUp
                className={`w-3 h-3 text-slate-400 transition-transform ${
                  showMoodMenu ? 'rotate-180' : ''
                }`}
              />
            </button>

            {showMoodMenu && (
              <div className="absolute bottom-12 right-0 w-52 bg-[#10131f] border border-white/10 rounded-2xl p-2 shadow-2xl z-50 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2">
                <div className="px-2 py-1.5 border-b border-white/5 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  Override Mood Atmosphere
                </div>
                <div className="grid grid-cols-2 gap-1 py-1">
                  {(Object.keys(MOOD_CONFIGS) as MoodType[]).map((m) => {
                    const cfg = MOOD_CONFIGS[m];
                    const isCurrent = m === currentMood;
                    return (
                      <button
                        key={m}
                        onClick={() => {
                          onSelectMood(m);
                          setShowMoodMenu(false);
                        }}
                        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                          isCurrent
                            ? 'bg-white/15 text-white font-semibold'
                            : 'text-slate-300 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: cfg.colors.primary }}
                        />
                        <span className="truncate">{m}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Visualizer Mode Dropdown */}
          <select
            value={visualizerMode}
            onChange={(e) => onSelectVisualizerMode(e.target.value as VisualizerMode)}
            aria-label="Select visualizer style"
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 font-medium cursor-pointer outline-none transition-all"
          >
            <option value="auto" className="bg-[#10131f] text-slate-200">
              Auto Mood
            </option>
            <option value="spectrum" className="bg-[#10131f] text-slate-200">
              Spectrum
            </option>
            <option value="waves" className="bg-[#10131f] text-slate-200">
              Fluid Waves
            </option>
            <option value="particles" className="bg-[#10131f] text-slate-200">
              Universe
            </option>
            <option value="neon" className="bg-[#10131f] text-slate-200">
              Neon Pulse
            </option>
            <option value="cinematic" className="bg-[#10131f] text-slate-200">
              Cinematic
            </option>
            <option value="ambient" className="bg-[#10131f] text-slate-200">
              Ambient
            </option>
            <option value="lyrics" className="bg-[#10131f] text-slate-200">
              Lyrics Stage
            </option>
          </select>

          {/* Lyrics Button */}
          <button
            onClick={onToggleLyrics}
            aria-label="Toggle synced lyrics"
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              showLyrics
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="Synced Lyrics"
          >
            <Mic2 className="w-4 h-4" />
          </button>

          {/* Equalizer Quick Button */}
          <button
            onClick={onOpenEqualizer}
            aria-label="Open Equalizer"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            title="10-Band EQ"
          >
            <Sliders className="w-4 h-4 text-emerald-400" />
          </button>

          {/* Volume Slider with Mute */}
          <div className="flex items-center gap-2 group">
            <button
              onClick={onToggleMute}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
              className="text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              aria-label="Volume control"
              className="w-18 h-1 bg-white/10 rounded-lg accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Fullscreen Visualizer Button */}
          <button
            onClick={onToggleFullscreen}
            aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </footer>
    </>
  );
};
