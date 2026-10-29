import React from 'react';
import { X, Settings as SettingsIcon, Sliders, Eye, Zap, ShieldCheck } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reducedMotion: boolean;
  onToggleReducedMotion: (val: boolean) => void;
  visualizerFps: 60 | 30;
  onChangeFps: (val: 60 | 30) => void;
  audioBitrate: '24bit' | '16bit';
  onChangeBitrate: (val: '24bit' | '16bit') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  reducedMotion,
  onToggleReducedMotion,
  visualizerFps,
  onChangeFps,
  audioBitrate,
  onChangeBitrate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-lg bg-[#0e111c] border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-500/20 text-violet-300 border border-violet-500/30">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Audio & Visual Settings</h3>
              <p className="text-xs text-slate-400">Configure playback quality, visuals, and accessibility</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options List */}
        <div className="flex flex-col gap-4">
          {/* Audio Output Fidelity */}
          <div className="flex items-center justify-between p-3.5 bg-white/5 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3">
              <Zap className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="text-xs font-semibold text-white block">Hi-Fi Audio Pipeline</span>
                <span className="text-[10px] text-slate-400">Studio master processing resolution</span>
              </div>
            </div>
            <select
              value={audioBitrate}
              onChange={(e) => onChangeBitrate(e.target.value as any)}
              className="bg-black/50 border border-white/10 text-white text-xs rounded-xl px-2.5 py-1.5 outline-none cursor-pointer"
            >
              <option value="24bit">24-bit 96 kHz (Lossless)</option>
              <option value="16bit">16-bit 44.1 kHz (Standard)</option>
            </select>
          </div>

          {/* Visualizer Frame Rate */}
          <div className="flex items-center justify-between p-3.5 bg-white/5 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-xs font-semibold text-white block">Visualizer Frame Rate</span>
                <span className="text-[10px] text-slate-400">Adaptive canvas render target</span>
              </div>
            </div>
            <select
              value={visualizerFps}
              onChange={(e) => onChangeFps(parseInt(e.target.value, 10) as any)}
              className="bg-black/50 border border-white/10 text-white text-xs rounded-xl px-2.5 py-1.5 outline-none cursor-pointer"
            >
              <option value={60}>60 FPS (Ultra Smooth)</option>
              <option value={30}>30 FPS (Battery Saver)</option>
            </select>
          </div>

          {/* Reduced Motion Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-white/5 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3">
              <Eye className="w-4 h-4 text-pink-400" />
              <div>
                <span className="text-xs font-semibold text-white block">Reduced Motion Mode</span>
                <span className="text-[10px] text-slate-400">Soften intense screen flashes and rapid pulses</span>
              </div>
            </div>
            <button
              onClick={() => onToggleReducedMotion(!reducedMotion)}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                reducedMotion ? 'bg-pink-500' : 'bg-white/15'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  reducedMotion ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Privacy & Offline Info */}
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-300">
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            <span>All audio decoding and visual synthesis runs 100% locally in your browser.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-white/5 pt-4">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-white font-medium bg-cyan-600 hover:bg-cyan-500 transition-all cursor-pointer text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
