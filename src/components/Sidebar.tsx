import React from 'react';
import {
  Music,
  Compass,
  FolderHeart,
  Sliders,
  Sparkles,
  BookOpen,
  Settings as SettingsIcon,
  PlusCircle,
  WifiOff,
  Radio,
} from 'lucide-react';
import { MoodType } from '../types';
import { MOOD_CONFIGS } from '../utils/moodClassifier';

interface SidebarProps {
  currentTab: 'home' | 'library' | 'playlists' | 'moods';
  onSelectTab: (tab: 'home' | 'library' | 'playlists' | 'moods') => void;
  onOpenUpload: () => void;
  onOpenEqualizer: () => void;
  onOpenGuide: () => void;
  onOpenSettings: () => void;
  currentMood: MoodType;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenUpload,
  onOpenEqualizer,
  onOpenGuide,
  onOpenSettings,
  currentMood,
}) => {
  const moodConfig = MOOD_CONFIGS[currentMood] || MOOD_CONFIGS.Energetic;

  return (
    <>
      {/* 1. Desktop Left Sidebar (Visible on md+ screens) */}
      <aside className="hidden md:flex w-64 flex-shrink-0 flex-col justify-between bg-[#0b0d14]/90 backdrop-blur-xl border-r border-white/5 p-5 select-none z-20">
        <div className="flex flex-col gap-6">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 px-1">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden transition-all duration-500"
              style={{
                background: `linear-gradient(135deg, ${moodConfig.colors.primary}, ${moodConfig.colors.secondary})`,
                boxShadow: `0 0 20px ${moodConfig.colors.glow}`,
              }}
            >
              <Radio className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-wider text-white">VIBEWAVE</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Adaptive Music Space</p>
            </div>
          </div>

          {/* Primary Navigation */}
          <nav className="flex flex-col gap-1.5" aria-label="Main Navigation">
            <button
              onClick={() => onSelectTab('home')}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                currentTab === 'home'
                  ? 'bg-white/10 text-white shadow-inner font-semibold border border-white/10'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Discover & Live</span>
            </button>

            <button
              onClick={() => onSelectTab('library')}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                currentTab === 'library'
                  ? 'bg-white/10 text-white shadow-inner font-semibold border border-white/10'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Music className="w-4 h-4 text-violet-400" />
              <span>Music Library</span>
            </button>

            <button
              onClick={() => onSelectTab('playlists')}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                currentTab === 'playlists'
                  ? 'bg-white/10 text-white shadow-inner font-semibold border border-white/10'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <FolderHeart className="w-4 h-4 text-pink-400" />
              <span>Playlists</span>
            </button>

            <button
              onClick={() => onSelectTab('moods')}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                currentTab === 'moods'
                  ? 'bg-white/10 text-white shadow-inner font-semibold border border-white/10'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Mood Sanctuary</span>
            </button>
          </nav>

          {/* Quick Tools & Import */}
          <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
            <span className="text-[11px] font-mono font-medium text-slate-500 uppercase tracking-wider px-2">
              Studio Tools
            </span>

            <button
              onClick={onOpenUpload}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-cyan-500/10 hover:border-cyan-500/30 border border-transparent transition-all cursor-pointer group"
            >
              <PlusCircle className="w-4 h-4 text-cyan-400 group-hover:rotate-90 transition-transform" />
              <span>Import Local Audio / LRC</span>
            </button>

            <button
              onClick={onOpenEqualizer}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 border border-transparent transition-all cursor-pointer"
            >
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>10-Band EQ & 3D Spatial</span>
            </button>

            <button
              onClick={onOpenGuide}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-cyan-300 bg-cyan-950/30 border border-cyan-800/40 hover:bg-cyan-900/40 transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>VS Code & APK Setup</span>
            </button>
          </div>
        </div>

        {/* Bottom Footer Details */}
        <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <div className="flex items-center gap-1.5">
              <WifiOff className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-mono">Offline PWA</span>
            </div>
            <span className="font-mono text-[10px] text-slate-500">24-bit 96k</span>
          </div>

          <button
            onClick={onOpenSettings}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <SettingsIcon className="w-4 h-4" />
              <span>Settings</span>
            </span>
            <span className="text-[10px] font-mono text-slate-500">v2.4</span>
          </button>
        </div>
      </aside>

      {/* 2. Mobile Native Bottom Navigation Bar (Visible on mobile screens) */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 h-16 bg-[#090b12]/95 backdrop-blur-2xl border-t border-white/10 z-40 flex items-center justify-around px-2 select-none"
        aria-label="Mobile Navigation"
      >
        <button
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
            currentTab === 'home' ? 'text-cyan-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px]">Discover</span>
        </button>

        <button
          onClick={() => onSelectTab('library')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
            currentTab === 'library' ? 'text-violet-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <Music className="w-5 h-5" />
          <span className="text-[10px]">Library</span>
        </button>

        <button
          onClick={() => onSelectTab('playlists')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
            currentTab === 'playlists' ? 'text-pink-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <FolderHeart className="w-5 h-5" />
          <span className="text-[10px]">Playlists</span>
        </button>

        <button
          onClick={() => onSelectTab('moods')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
            currentTab === 'moods' ? 'text-amber-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px]">Moods</span>
        </button>

        <button
          onClick={onOpenEqualizer}
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-emerald-400 cursor-pointer"
        >
          <Sliders className="w-5 h-5" />
          <span className="text-[10px]">EQ</span>
        </button>
      </nav>
    </>
  );
};
