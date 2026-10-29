import React, { useEffect, useRef, useState } from 'react';
import { Track, MoodType } from '../types';
import { findActiveLyricIndex, formatTime, parseLrc } from '../utils/lrcParser';
import { MOOD_CONFIGS } from '../utils/moodClassifier';
import { X, Sparkles, FileText, UploadCloud, Check } from 'lucide-react';

interface LyricsPanelProps {
  track: Track | null;
  currentTime: number;
  currentMood: MoodType;
  onSeek: (seconds: number) => void;
  onClose: () => void;
  onUpdateLyrics?: (trackId: string, rawText: string) => void;
}

export const LyricsPanel: React.FC<LyricsPanelProps> = ({
  track,
  currentTime,
  currentMood,
  onSeek,
  onClose,
  onUpdateLyrics,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeLineRef = useRef<HTMLDivElement | null>(null);
  const moodConfig = MOOD_CONFIGS[currentMood] || MOOD_CONFIGS.Energetic;

  const [isEditing, setIsEditing] = useState(false);
  const [customLrcInput, setCustomLrcInput] = useState('');

  const lyrics = track?.lyrics || [];
  const activeIndex = findActiveLyricIndex(lyrics, currentTime);

  // Auto-scroll active line into view smoothly
  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIndex]);

  const handleSaveCustomLyrics = () => {
    if (track && onUpdateLyrics && customLrcInput.trim()) {
      onUpdateLyrics(track.id, customLrcInput.trim());
      setIsEditing(false);
    }
  };

  return (
    <aside
      className="w-96 flex-shrink-0 flex flex-col bg-[#0b0d17]/95 backdrop-blur-2xl border-l border-white/5 p-6 select-none z-20 h-full overflow-hidden"
      aria-label="Synchronized Lyrics"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full animate-pulse"
            style={{ backgroundColor: moodConfig.colors.primary }}
          />
          <h2 className="text-sm font-bold text-white tracking-wide uppercase font-mono">
            Synced Lyrics
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-pointer font-medium"
          >
            {isEditing ? 'Cancel' : 'Edit / Import'}
          </button>
          <button
            onClick={onClose}
            aria-label="Close lyrics"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor Modal View */}
      {isEditing ? (
        <div className="flex-1 flex flex-col gap-3 pt-4">
          <p className="text-xs text-slate-400">
            Paste timestamped LRC format (e.g. <code>[00:15.50] Lyric line</code>) or plain text:
          </p>
          <textarea
            value={customLrcInput}
            onChange={(e) => setCustomLrcInput(e.target.value)}
            placeholder="[00:05.00] Enter lyric lines here..."
            className="flex-1 w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs font-mono text-slate-200 outline-none focus:border-cyan-500/50 resize-none"
          />
          <button
            onClick={handleSaveCustomLyrics}
            className="w-full py-2.5 rounded-xl font-medium text-xs text-white bg-cyan-600 hover:bg-cyan-500 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
          >
            <Check className="w-4 h-4" />
            <span>Apply Synced Lyrics</span>
          </button>
        </div>
      ) : (
        /* Lyrics Scrolling Stage */
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto py-12 flex flex-col gap-8 scroll-smooth no-scrollbar"
        >
          {lyrics.length > 0 ? (
            lyrics.map((line, idx) => {
              const isActive = idx === activeIndex;
              const isPast = idx < activeIndex;

              return (
                <div
                  key={line.id}
                  ref={isActive ? activeLineRef : null}
                  onClick={() => onSeek(line.time)}
                  className={`group flex items-start gap-3 transition-all duration-300 cursor-pointer text-left ${
                    isActive
                      ? 'scale-105 opacity-100'
                      : isPast
                      ? 'opacity-35 hover:opacity-75'
                      : 'opacity-50 hover:opacity-90'
                  }`}
                >
                  <span className="text-[10px] font-mono text-slate-500 pt-1 group-hover:text-cyan-400 min-w-[32px]">
                    {formatTime(line.time)}
                  </span>
                  <p
                    className={`text-lg font-semibold leading-relaxed transition-all ${
                      isActive
                        ? 'font-extrabold tracking-wide drop-shadow-md'
                        : 'font-medium'
                    }`}
                    style={{
                      color: isActive ? moodConfig.colors.accent : undefined,
                      textShadow: isActive ? `0 0 20px ${moodConfig.colors.glow}` : undefined,
                    }}
                  >
                    {line.text}
                  </p>
                </div>
              );
            })
          ) : (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${moodConfig.colors.primary}33, ${moodConfig.colors.secondary}22)`,
                  boxShadow: `0 0 30px ${moodConfig.colors.glow}`,
                }}
              >
                <Sparkles className="w-8 h-8 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white mb-1">Feel The Music</h3>
                <p className="text-xs text-slate-400 max-w-[220px]">
                  No synced timestamps attached to this track yet. Import or paste lyrics anytime!
                </p>
              </div>

              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-cyan-300 bg-cyan-950/40 border border-cyan-800/50 hover:bg-cyan-900/40 transition-all cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Add Custom Lyrics</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Footer Info */}
      {track && (
        <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
          <span className="truncate">{track.title}</span>
          <span className="font-mono text-cyan-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            Karaoke Synced
          </span>
        </div>
      )}
    </aside>
  );
};
