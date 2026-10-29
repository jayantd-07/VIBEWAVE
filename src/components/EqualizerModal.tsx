import React from 'react';
import { X, Sliders, Volume2, Sparkles, RotateCcw } from 'lucide-react';
import { EQ_FREQUENCIES, EQ_PRESETS } from '../audio/audioEngine';
import { EqualizerState, MoodType } from '../types';
import { MOOD_CONFIGS } from '../utils/moodClassifier';

interface EqualizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  eqState: EqualizerState;
  onUpdateBands: (bands: number[]) => void;
  onSelectPreset: (presetName: string) => void;
  onToggleBassBoost: (enabled: boolean) => void;
  onToggleSpatial: (enabled: boolean) => void;
  currentMood: MoodType;
}

export const EqualizerModal: React.FC<EqualizerModalProps> = ({
  isOpen,
  onClose,
  eqState,
  onUpdateBands,
  onSelectPreset,
  onToggleBassBoost,
  onToggleSpatial,
  currentMood,
}) => {
  if (!isOpen) return null;

  const moodConfig = MOOD_CONFIGS[currentMood] || MOOD_CONFIGS.Energetic;

  const handleBandChange = (index: number, val: number) => {
    const updated = [...eqState.bands];
    updated[index] = val;
    onUpdateBands(updated);
  };

  const handleReset = () => {
    onSelectPreset('Flat');
    onToggleBassBoost(false);
    onToggleSpatial(false);
  };

  const formatFreq = (hz: number) => {
    if (hz >= 1000) return `${hz / 1000}k`;
    return `${hz}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-2xl bg-[#0e111c] border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-xl text-white shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${moodConfig.colors.primary}, ${moodConfig.colors.secondary})`,
              }}
            >
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                10-Band Hi-Fi Equalizer
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  DSP Active
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Precision 64-bit Web Audio Biquad filtering with zero distortion
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer flex items-center gap-1.5 text-xs"
              title="Reset EQ"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preset Selector & Quick Enhancers */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Acoustic Preset:</span>
            <select
              value={eqState.preset}
              onChange={(e) => onSelectPreset(e.target.value)}
              className="bg-black/50 border border-white/10 text-white text-xs rounded-xl px-3 py-1.5 outline-none cursor-pointer"
            >
              {Object.keys(EQ_PRESETS).map((p) => (
                <option key={p} value={p} className="bg-[#10131f]">
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4">
            {/* Bass Boost Toggle */}
            <button
              onClick={() => onToggleBassBoost(!eqState.bassBoost)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                eqState.bassBoost
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-lg shadow-rose-950/50'
                  : 'bg-white/5 text-slate-400 border-white/5 hover:text-white'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Sub-Bass +8dB</span>
            </button>

            {/* 3D Spatial Audio Toggle */}
            <button
              onClick={() => onToggleSpatial(!eqState.spatial3D)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                eqState.spatial3D
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-lg shadow-cyan-950/50'
                  : 'bg-white/5 text-slate-400 border-white/5 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>3D Spatial Sound</span>
            </button>
          </div>
        </div>

        {/* 10-Band Sliders Grid */}
        <div className="grid grid-cols-10 gap-2 items-center justify-items-center py-4 px-2">
          {EQ_FREQUENCIES.map((freq, idx) => {
            const val = eqState.bands[idx] ?? 0;
            return (
              <div key={freq} className="flex flex-col items-center gap-3 w-full">
                <span className="text-[10px] font-mono font-medium text-slate-400">
                  {val > 0 ? `+${val.toFixed(1)}` : val.toFixed(1)}
                </span>

                <div className="h-44 flex items-center justify-center relative py-2">
                  <input
                    type="range"
                    min={-12}
                    max={12}
                    step={0.5}
                    value={val}
                    onChange={(e) => handleBandChange(idx, parseFloat(e.target.value))}
                    aria-label={`Equalizer band ${freq} Hz`}
                    style={{
                      writingMode: 'vertical-lr',
                      direction: 'rtl',
                    }}
                    className="h-36 w-2 accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-[11px] font-mono font-bold text-slate-200">
                    {formatFreq(freq)}
                  </span>
                  <span className="text-[9px] font-mono text-slate-500">Hz</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-slate-400 border-t border-white/5 pt-4">
          <span>Range: -12 dB to +12 dB</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-white font-medium bg-cyan-600 hover:bg-cyan-500 transition-all cursor-pointer shadow-lg"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
    