import React, { useState } from 'react';
import {
  Play,
  Pause,
  Sparkles,
  Heart,
  Music,
  Plus,
  Search,
  Flame,
  Radio,
  FolderHeart,
  ChevronRight,
  Maximize2,
} from 'lucide-react';
import { Track, MoodType, VisualizerMode, Playlist } from '../types';
import { MOOD_CONFIGS } from '../utils/moodClassifier';
import { formatTime } from '../utils/lrcParser';
import { VisualizerCanvas } from '../visualizer/VisualizerCanvas';

interface MainContentProps {
  currentTab: 'home' | 'library' | 'playlists' | 'moods';
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  currentMood: MoodType;
  moodConfidence: number;
  visualizerMode: VisualizerMode;
  isFullscreen: boolean;
  onPlayTrack: (track: Track) => void;
  onTogglePlay: () => void;
  onSelectMood: (mood: MoodType) => void;
  onToggleFullscreen: () => void;
  onOpenUpload: () => void;
  onOpenEqualizer: () => void;
  playlists: Playlist[];
  onCreatePlaylist: (name: string) => void;
  favorites: string[];
  onToggleFavorite: (trackId: string) => void;
}

export const MainContent: React.FC<MainContentProps> = ({
  currentTab,
  tracks,
  currentTrack,
  isPlaying,
  currentMood,
  moodConfidence,
  visualizerMode,
  isFullscreen,
  onPlayTrack,
  onTogglePlay,
  onSelectMood,
  onToggleFullscreen,
  onOpenUpload,
  playlists,
  onCreatePlaylist,
  favorites,
  onToggleFavorite,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre] = useState<string>('All');
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showNewPlaylistInput, setShowNewPlaylistInput] = useState(false);

  const moodConfig = MOOD_CONFIGS[currentMood] || MOOD_CONFIGS.Energetic;

  // Filter tracks by query and genre
  const filteredTracks = tracks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.mood.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === 'All' || t.genre.toLowerCase().includes(selectedGenre.toLowerCase());
    return matchesSearch && matchesGenre;
  });

  // Recommended tracks for current mood
  const moodMatchedTracks = tracks.filter((t) => t.mood === currentMood);

  return (
    <main
      className="flex-1 overflow-y-auto flex flex-col gap-6 md:gap-8 p-4 md:p-8 pb-36 md:pb-8 relative transition-colors duration-700"
      style={{
        background: moodConfig.colors.bgGradient,
      }}
    >
      {/* 1. Dynamic Hero Stage: Visualizer & Active Song Showcase */}
      <section className="relative w-full h-64 sm:h-72 md:h-84 rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black/60 flex flex-col justify-between p-4 sm:p-6 md:p-7 select-none group">
        {/* Full Interactive Visualizer Canvas Background */}
        <div className="absolute inset-0 z-0">
          <VisualizerCanvas
            mode={visualizerMode}
            currentMood={currentMood}
            isFullscreen={isFullscreen}
            onToggleFullscreen={onToggleFullscreen}
            className="w-full h-full"
          />
        </div>

        {/* Ambient Dark Gradient Vignette Overlay to ensure perfect readable contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07080d] via-black/40 to-black/20 pointer-events-none z-10" />

        {/* Hero Top Bar */}
        <div className="relative z-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold text-white flex items-center gap-1.5 shadow-lg border border-white/10 backdrop-blur-md"
              style={{
                backgroundColor: `${moodConfig.colors.primary}44`,
                borderColor: moodConfig.colors.primary,
              }}
            >
              <Sparkles className="w-3.5 h-3.5" style={{ color: moodConfig.colors.accent }} />
              <span>{moodConfig.label}</span>
              <span className="text-[10px] font-mono opacity-80">({moodConfidence}%)</span>
            </span>

            {currentTrack?.sections && (
              <span className="hidden sm:inline-block px-2.5 py-1 rounded-full text-[10px] font-mono text-cyan-300 bg-cyan-950/50 border border-cyan-800/40 backdrop-blur-md">
                Section: {currentTrack.sections[0]?.label || 'Active'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleFullscreen}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-black/50 hover:bg-black/70 border border-white/10 text-xs font-mono text-slate-300 backdrop-blur-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Immersive Stage</span>
              <span className="sm:hidden">Full</span>
            </button>
          </div>
        </div>

        {/* Hero Bottom Bar: Currently Playing Details */}
        <div className="relative z-20 flex items-end justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-5 min-w-0">
            {currentTrack && (
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl object-cover shadow-2xl border-2 border-white/20 group-hover:scale-105 transition-transform flex-shrink-0"
              />
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/30">
                  {currentTrack?.genre || 'Hi-Fi Audio'}
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono text-slate-400">
                  {currentTrack?.bpm || 120} BPM
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight drop-shadow-md truncate">
                {currentTrack?.title || 'Welcome to VIBEWAVE'}
              </h1>
              <p className="text-xs sm:text-sm font-medium text-slate-300 mt-0.5 truncate">
                {currentTrack?.artist || 'Intelligent audio-reactive visualizer'}
              </p>
            </div>
          </div>

          <button
            onClick={onTogglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-white transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-2xl flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, ${moodConfig.colors.primary}, ${moodConfig.colors.secondary})`,
              boxShadow: `0 0 25px ${moodConfig.colors.glow}`,
            }}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 sm:w-7 sm:h-7 fill-white text-white" />
            ) : (
              <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-white text-white translate-x-0.5" />
            )}
          </button>
        </div>
      </section>

      {/* 2. Mood Explorer Quick Pills */}
      <section className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs sm:text-sm font-bold text-slate-300 font-mono uppercase tracking-wider flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Atmosphere Tuning (10 Moods)</span>
          </h2>
          <span className="text-[10px] sm:text-xs text-slate-400">Tap to transform visuals</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {(Object.keys(MOOD_CONFIGS) as MoodType[]).map((m) => {
            const isSelected = m === currentMood;
            const cfg = MOOD_CONFIGS[m];
            return (
              <button
                key={m}
                onClick={() => onSelectMood(m)}
                className={`flex items-center gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  isSelected
                    ? 'text-white border-transparent shadow-lg scale-105'
                    : 'text-slate-400 bg-white/5 border-white/5 hover:text-white hover:bg-white/10'
                }`}
                style={{
                  background: isSelected
                    ? `linear-gradient(135deg, ${cfg.colors.primary}, ${cfg.colors.secondary})`
                    : undefined,
                  boxShadow: isSelected ? `0 0 15px ${cfg.colors.glow}` : undefined,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: cfg.colors.accent }}
                />
                <span>{m}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Conditional Tabs View: Home, Library, Playlists, Moods */}
      {currentTab === 'home' && (
        <>
          {/* Mood Recommendations */}
          {moodMatchedTracks.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-xs sm:text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Synchronized with {currentMood} Vibe</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {moodMatchedTracks.map((t) => {
                  const isCur = currentTrack?.id === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => onPlayTrack(t)}
                      className={`group p-3 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 sm:gap-4 ${
                        isCur
                          ? 'bg-white/15 border-cyan-500/50 shadow-xl'
                          : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <img
                        src={t.coverUrl}
                        alt={t.title}
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover shadow-md group-hover:scale-105 transition-transform flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-white truncate">{t.title}</h4>
                        <p className="text-xs text-slate-400 truncate">{t.artist}</p>
                        <div className="flex items-center gap-2 mt-1.5 sm:mt-2">
                          <span className="text-[9px] sm:text-[10px] font-mono text-cyan-300 px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40">
                            {t.genre}
                          </span>
                          <span className="text-[9px] sm:text-[10px] font-mono text-slate-400">
                            {formatTime(t.duration)}
                          </span>
                        </div>
                      </div>
                      <button
                        aria-label="Play track"
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center sm:opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      >
                        <Play className="w-4 h-4 fill-cyan-400" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* All Music Catalog */}
          <section className="flex flex-col gap-3 sm:gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs sm:text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                <Music className="w-4 h-4 text-violet-400" />
                <span>Featured Master Tracks</span>
              </h2>
              <button
                onClick={onOpenUpload}
                className="text-xs font-medium text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Local Song</span>
              </button>
            </div>

            <div className="bg-[#0b0d17]/80 rounded-2xl border border-white/5 overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-slate-500 font-mono text-[10px] uppercase">
                    <th className="py-2.5 sm:py-3 px-3 sm:px-4 w-8 sm:w-12 hidden sm:table-cell">#</th>
                    <th className="py-2.5 sm:py-3 px-3 sm:px-4">Title & Artist</th>
                    <th className="py-2.5 sm:py-3 px-3 sm:px-4 hidden md:table-cell">Mood</th>
                    <th className="py-2.5 sm:py-3 px-3 sm:px-4 hidden sm:table-cell">Format</th>
                    <th className="py-2.5 sm:py-3 px-3 sm:px-4 text-right">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {tracks.map((t, index) => {
                    const isCur = currentTrack?.id === t.id;
                    const isFav = favorites.includes(t.id);
                    return (
                      <tr
                        key={t.id}
                        onClick={() => onPlayTrack(t)}
                        className={`group border-b border-white/5 transition-colors cursor-pointer ${
                          isCur ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-slate-300'
                        }`}
                      >
                        <td className="py-2.5 sm:py-3 px-3 sm:px-4 font-mono text-slate-500 hidden sm:table-cell">
                          {isCur && isPlaying ? (
                            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                          ) : (
                            index + 1
                          )}
                        </td>
                        <td className="py-2.5 sm:py-3 px-3 sm:px-4">
                          <div className="flex items-center gap-2.5 sm:gap-3">
                            <img
                              src={t.coverUrl}
                              alt={t.title}
                              className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <span className="font-semibold block text-white group-hover:text-cyan-300 transition-colors truncate">
                                {t.title}
                              </span>
                              <span className="text-slate-400 text-[11px] truncate block">
                                {t.artist}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 sm:py-3 px-3 sm:px-4 hidden md:table-cell">
                          <span
                            className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold"
                            style={{
                              backgroundColor: `${MOOD_CONFIGS[t.mood]?.colors.primary}25`,
                              color: MOOD_CONFIGS[t.mood]?.colors.accent,
                              border: `1px solid ${MOOD_CONFIGS[t.mood]?.colors.primary}40`,
                            }}
                          >
                            {t.mood}
                          </span>
                        </td>
                        <td className="py-2.5 sm:py-3 px-3 sm:px-4 hidden sm:table-cell font-mono text-[10px] text-slate-400">
                          {t.format || 'FLAC 24-bit'}
                        </td>
                        <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right font-mono text-slate-400">
                          <div className="flex items-center justify-end gap-2 sm:gap-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleFavorite(t.id);
                              }}
                              className="text-slate-500 hover:text-pink-400 transition-colors p-1"
                            >
                              <Heart
                                className={`w-3.5 h-3.5 ${
                                  isFav ? 'fill-pink-500 text-pink-500' : ''
                                }`}
                              />
                            </button>
                            <span>{formatTime(t.duration)}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {/* Library Tab */}
      {currentTab === 'library' && (
        <section className="flex flex-col gap-5 sm:gap-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">Your Music Library</h2>
              <p className="text-xs text-slate-400">
                {tracks.length} tracks available offline and ready for real-time visualization
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search tracks, artists..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64 bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500/50"
                />
              </div>

              <button
                onClick={onOpenUpload}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 transition-all flex items-center gap-1.5 shadow-lg flex-shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Import Audio</span>
                <span className="sm:hidden">Import</span>
              </button>
            </div>
          </div>

          <div className="bg-[#0b0d17]/80 rounded-2xl border border-white/5 overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/5 text-slate-500 font-mono text-[10px] uppercase">
                  <th className="py-2.5 sm:py-3 px-3 sm:px-4 w-8 sm:w-12 hidden sm:table-cell">#</th>
                  <th className="py-2.5 sm:py-3 px-3 sm:px-4">Title & Artist</th>
                  <th className="py-2.5 sm:py-3 px-3 sm:px-4 hidden md:table-cell">Genre</th>
                  <th className="py-2.5 sm:py-3 px-3 sm:px-4 hidden sm:table-cell">Mood</th>
                  <th className="py-2.5 sm:py-3 px-3 sm:px-4 text-right">Length</th>
                </tr>
              </thead>
              <tbody>
                {filteredTracks.map((t, idx) => (
                  <tr
                    key={t.id}
                    onClick={() => onPlayTrack(t)}
                    className="border-b border-white/5 hover:bg-white/5 text-slate-300 transition-colors cursor-pointer group"
                  >
                    <td className="py-2.5 sm:py-3 px-3 sm:px-4 font-mono text-slate-500 hidden sm:table-cell">{idx + 1}</td>
                    <td className="py-2.5 sm:py-3 px-3 sm:px-4">
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <img
                          src={t.coverUrl}
                          alt={t.title}
                          className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="font-semibold block text-white group-hover:text-cyan-400 truncate">
                            {t.title}
                          </span>
                          <span className="text-[11px] text-slate-400 truncate block">{t.artist}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-slate-400 hidden md:table-cell">{t.genre}</td>
                    <td className="py-2.5 sm:py-3 px-3 sm:px-4 hidden sm:table-cell">
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white/10 text-slate-200">
                        {t.mood}
                      </span>
                    </td>
                    <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right font-mono text-slate-400">
                      {formatTime(t.duration)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Playlists Tab */}
      {currentTab === 'playlists' && (
        <section className="flex flex-col gap-5 sm:gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">Custom Playlists</h2>
              <p className="text-xs text-slate-400">Create mood-focused listening journeys</p>
            </div>
            <button
              onClick={() => setShowNewPlaylistInput(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-pink-600 hover:bg-pink-500 transition-all flex items-center gap-1.5 shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Create Playlist</span>
            </button>
          </div>

          {showNewPlaylistInput && (
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
              <input
                type="text"
                placeholder="Enter playlist title (e.g. Cyber Workout)..."
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50"
              />
              <button
                onClick={() => {
                  if (newPlaylistName.trim()) {
                    onCreatePlaylist(newPlaylistName.trim());
                    setNewPlaylistName('');
                    setShowNewPlaylistInput(false);
                  }
                }}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-medium cursor-pointer"
              >
                Save
              </button>
              <button
                onClick={() => setShowNewPlaylistInput(false)}
                className="px-3 py-2 text-slate-400 text-xs"
              >
                Cancel
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
            {playlists.map((pl) => (
              <div
                key={pl.id}
                className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 transition-all cursor-pointer group flex flex-col justify-between h-40 sm:h-48"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
                    <FolderHeart className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    {pl.trackIds.length} tracks
                  </span>
                </div>

                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-pink-300 transition-colors">
                    {pl.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {pl.description || 'Personalized audio collection'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Mood Sanctuary Tab */}
      {currentTab === 'moods' && (
        <section className="flex flex-col gap-5 sm:gap-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">Mood Sanctuary</h2>
            <p className="text-xs text-slate-400">
              Explore the 10 distinct emotional sonic states and visual atmospheres
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {(Object.keys(MOOD_CONFIGS) as MoodType[]).map((m) => {
              const cfg = MOOD_CONFIGS[m];
              const isCur = currentMood === m;
              return (
                <div
                  key={m}
                  onClick={() => onSelectMood(m)}
                  className={`p-5 sm:p-6 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between gap-4 group ${
                    isCur
                      ? 'border-white/30 shadow-2xl scale-[1.02]'
                      : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/15'
                  }`}
                  style={{
                    background: isCur ? cfg.colors.bgGradient : undefined,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="w-3.5 h-3.5 rounded-full shadow-lg"
                      style={{ backgroundColor: cfg.colors.primary }}
                    />
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                      Atmosphere
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center justify-between">
                      <span>{cfg.label}</span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </h3>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      {cfg.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-white/5 text-[11px] font-mono text-slate-300">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: cfg.colors.secondary }}
                    />
                    <span>Particle Velocity: {cfg.particleSpeed}x</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
};
