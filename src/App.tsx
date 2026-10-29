import React, { useState, useEffect, useCallback } from 'react';
import { Track, MoodType, VisualizerMode, EqualizerState, Playlist } from './types';
import { BUILTIN_TRACKS } from './audio/synthTracks';
import { audioEngine, EQ_PRESETS } from './audio/audioEngine';
import { parseLrc } from './utils/lrcParser';
import { estimateMood } from './utils/moodClassifier';
import { Sidebar } from './components/Sidebar';
import { MainContent } from './components/MainContent';
import { PlayerBar } from './components/PlayerBar';
import { LyricsPanel } from './components/LyricsPanel';
import { EqualizerModal } from './components/EqualizerModal';
import { TrackUploadModal } from './components/TrackUploadModal';
import { DevGuideModal } from './components/DevGuideModal';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  // Initialize built-in tracks with parsed LRC lyrics
  const [tracks, setTracks] = useState<Track[]>(() =>
    BUILTIN_TRACKS.map((t) => ({
      ...t,
      lyrics: t.rawLyricsText ? parseLrc(t.rawLyricsText) : [],
    }))
  );

  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const currentTrack = tracks[currentTrackIndex] || tracks[0] || null;

  // Playback State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(144);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('all');

  // Mood & Visualizer State
  const [currentMood, setCurrentMood] = useState<MoodType>(currentTrack?.mood || 'Energetic');
  const [moodConfidence, setMoodConfidence] = useState<number>(88);
  const [visualizerMode, setVisualizerMode] = useState<VisualizerMode>('auto');
  const [showLyrics, setShowLyrics] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Navigation & Modals
  const [currentTab, setCurrentTab] = useState<'home' | 'library' | 'playlists' | 'moods'>('home');
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isEqualizerOpen, setIsEqualizerOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // User Library & Playlists
  const [favorites, setFavorites] = useState<string[]>(['track-cyberwave']);
  const [playlists, setPlaylists] = useState<Playlist[]>([
    {
      id: 'pl-1',
      name: 'Cyberpunk Surge ⚡',
      description: 'High velocity electronic beats with maximum bass punch',
      trackIds: ['track-cyberwave', 'track-golden-euphoria'],
      createdAt: Date.now(),
    },
    {
      id: 'pl-2',
      name: 'Midnight Melancholy 🌧️',
      description: 'Deep violet lofi ripples and introspective reverie',
      trackIds: ['track-midnight-rain', 'track-intimate-starlight'],
      createdAt: Date.now(),
    },
    {
      id: 'pl-3',
      name: 'Epic Titan Journeys ⚔️',
      description: 'Grand orchestral cinematic themes and thunderous drops',
      trackIds: ['track-epic-horizon'],
      createdAt: Date.now(),
    },
  ]);

  // Equalizer & Audio State
  const [eqState, setEqState] = useState<EqualizerState>({
    enabled: true,
    bassBoost: false,
    spatial3D: false,
    preset: 'Flat',
    bands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  });

  // Settings
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [visualizerFps, setVisualizerFps] = useState<60 | 30>(60);
  const [audioBitrate, setAudioBitrate] = useState<'24bit' | '16bit'>('24bit');

  // Load and play track
  const handlePlayTrack = useCallback(
    async (track: Track) => {
      const idx = tracks.findIndex((t) => t.id === track.id);
      if (idx !== -1) {
        setCurrentTrackIndex(idx);
      }
      setCurrentTime(0);
      setDuration(track.duration || 140);
      setCurrentMood(track.mood);

      await audioEngine.loadTrack(track, true);
      setIsPlaying(true);

      // Trigger server-side AI mood analysis if possible
      try {
        fetch('/api/analyze-track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: track.title,
            artist: track.artist,
            lyrics: track.rawLyricsText,
            bpm: track.bpm,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data?.success && data?.mood) {
              setMoodConfidence(data.confidence || 85);
            }
          })
          .catch(() => {});
      } catch {}
    },
    [tracks]
  );

  const handleTogglePlay = useCallback(async () => {
    if (!currentTrack) return;
    if (isPlaying) {
      audioEngine.pause();
      setIsPlaying(false);
    } else {
      if (audioEngine.getState().track?.id !== currentTrack.id) {
        await handlePlayTrack(currentTrack);
      } else {
        await audioEngine.play();
        setIsPlaying(true);
      }
    }
  }, [currentTrack, isPlaying, handlePlayTrack]);

  const handleNextTrack = useCallback(() => {
    if (tracks.length === 0) return;
    let nextIdx = currentTrackIndex + 1;
    if (isShuffle) {
      nextIdx = Math.floor(Math.random() * tracks.length);
    } else if (nextIdx >= tracks.length) {
      nextIdx = 0;
    }
    handlePlayTrack(tracks[nextIdx]);
  }, [tracks, currentTrackIndex, isShuffle, handlePlayTrack]);

  const handlePrevTrack = useCallback(() => {
    if (tracks.length === 0) return;
    let prevIdx = currentTrackIndex - 1;
    if (prevIdx < 0) {
      prevIdx = tracks.length - 1;
    }
    handlePlayTrack(tracks[prevIdx]);
  }, [tracks, currentTrackIndex, handlePlayTrack]);

  // Audio Engine Event Listeners
  useEffect(() => {
    const unsubscribe = audioEngine.addListener((event, data) => {
      if (event === 'timeupdate' && data) {
        setCurrentTime(data.currentTime);
        if (data.duration) setDuration(data.duration);
      } else if (event === 'playstate' && data) {
        setIsPlaying(data.isPlaying);
      } else if (event === 'ended') {
        if (repeatMode === 'one' && currentTrack) {
          audioEngine.seek(0);
          audioEngine.play();
        } else if (repeatMode === 'all') {
          handleNextTrack();
        } else {
          setIsPlaying(false);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [repeatMode, currentTrack, handleNextTrack]);

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          handleTogglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          audioEngine.seek(Math.max(0, currentTime - 5));
          break;
        case 'ArrowRight':
          e.preventDefault();
          audioEngine.seek(Math.min(duration, currentTime + 5));
          break;
        case 'ArrowUp':
          e.preventDefault();
          const upVol = Math.min(1, volume + 0.05);
          setVolume(upVol);
          audioEngine.setVolume(upVol);
          break;
        case 'ArrowDown':
          e.preventDefault();
          const downVol = Math.max(0, volume - 0.05);
          setVolume(downVol);
          audioEngine.setVolume(downVol);
          break;
        case 'KeyM':
          setIsMuted(!isMuted);
          audioEngine.setMute(!isMuted);
          break;
        case 'KeyL':
          setShowLyrics((prev) => !prev);
          break;
        case 'KeyV':
          setIsFullscreen((prev) => !prev);
          break;
        case 'KeyS':
          setIsShuffle((prev) => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTogglePlay, currentTime, duration, volume, isMuted]);

  // Equalizer Handlers
  const handleUpdateBands = (bands: number[]) => {
    setEqState((prev) => ({ ...prev, bands, preset: 'Custom' }));
    audioEngine.setEqualizerBands(bands);
  };

  const handleSelectPreset = (presetName: string) => {
    const bands = EQ_PRESETS[presetName] || EQ_PRESETS.Flat;
    setEqState((prev) => ({ ...prev, bands, preset: presetName }));
    audioEngine.setEqualizerBands(bands);
  };

  const handleToggleBassBoost = (enabled: boolean) => {
    setEqState((prev) => ({ ...prev, bassBoost: enabled }));
    audioEngine.setBassBoost(enabled);
  };

  const handleToggleSpatial = (enabled: boolean) => {
    setEqState((prev) => ({ ...prev, spatial3D: enabled }));
    audioEngine.setSpatial3D(enabled);
  };

  // Add Custom Uploaded Track
  const handleAddTrack = (newTrack: Track) => {
    setTracks((prev) => [newTrack, ...prev]);
    handlePlayTrack(newTrack);
  };

  // Update Track Lyrics from panel editor
  const handleUpdateLyrics = (trackId: string, rawText: string) => {
    const parsed = parseLrc(rawText);
    setTracks((prev) =>
      prev.map((t) => (t.id === trackId ? { ...t, lyrics: parsed, rawLyricsText: rawText } : t))
    );
  };

  const handleToggleFavorite = (trackId: string) => {
    setFavorites((prev) =>
      prev.includes(trackId) ? prev.filter((id) => id !== trackId) : [...prev, trackId]
    );
  };

  const handleCreatePlaylist = (name: string) => {
    const pl: Playlist = {
      id: `pl-${Date.now()}`,
      name,
      description: 'User curated collection',
      trackIds: currentTrack ? [currentTrack.id] : [],
      createdAt: Date.now(),
    };
    setPlaylists((prev) => [...prev, pl]);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#07080d] text-slate-100 select-none font-sans">
      {/* Main Workspace Frame (Sidebar + Content + Lyrics Panel) */}
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onOpenUpload={() => setIsUploadOpen(true)}
          onOpenEqualizer={() => setIsEqualizerOpen(true)}
          onOpenGuide={() => setIsGuideOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          currentMood={currentMood}
        />

        <MainContent
          currentTab={currentTab}
          tracks={tracks}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          currentMood={currentMood}
          moodConfidence={moodConfidence}
          visualizerMode={visualizerMode}
          isFullscreen={isFullscreen}
          onPlayTrack={handlePlayTrack}
          onTogglePlay={handleTogglePlay}
          onSelectMood={setCurrentMood}
          onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
          onOpenUpload={() => setIsUploadOpen(true)}
          onOpenEqualizer={() => setIsEqualizerOpen(true)}
          playlists={playlists}
          onCreatePlaylist={handleCreatePlaylist}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
        />

        {showLyrics && (
          <LyricsPanel
            track={currentTrack}
            currentTime={currentTime}
            currentMood={currentMood}
            onSeek={(t) => audioEngine.seek(t)}
            onClose={() => setShowLyrics(false)}
            onUpdateLyrics={handleUpdateLyrics}
          />
        )}
      </div>

      {/* Persistent Bottom Music Player Dock */}
      <PlayerBar
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        isShuffle={isShuffle}
        repeatMode={repeatMode}
        currentMood={currentMood}
        moodConfidence={moodConfidence}
        visualizerMode={visualizerMode}
        showLyrics={showLyrics}
        isFullscreen={isFullscreen}
        onPlayPause={handleTogglePlay}
        onSeek={(t) => audioEngine.seek(t)}
        onPrev={handlePrevTrack}
        onNext={handleNextTrack}
        onToggleShuffle={() => setIsShuffle(!isShuffle)}
        onCycleRepeat={() =>
          setRepeatMode((prev) => (prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off'))
        }
        onVolumeChange={(v) => {
          setVolume(v);
          audioEngine.setVolume(v);
        }}
        onToggleMute={() => {
          setIsMuted(!isMuted);
          audioEngine.setMute(!isMuted);
        }}
        onSelectMood={setCurrentMood}
        onSelectVisualizerMode={setVisualizerMode}
        onToggleLyrics={() => setShowLyrics(!showLyrics)}
        onOpenEqualizer={() => setIsEqualizerOpen(true)}
        onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
      />

      {/* Modals & Dialogs */}
      <EqualizerModal
        isOpen={isEqualizerOpen}
        onClose={() => setIsEqualizerOpen(false)}
        eqState={eqState}
        onUpdateBands={handleUpdateBands}
        onSelectPreset={handleSelectPreset}
        onToggleBassBoost={handleToggleBassBoost}
        onToggleSpatial={handleToggleSpatial}
        currentMood={currentMood}
      />

      <TrackUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onAddTrack={handleAddTrack}
        currentMood={currentMood}
      />

      <DevGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        reducedMotion={reducedMotion}
        onToggleReducedMotion={setReducedMotion}
        visualizerFps={visualizerFps}
        onChangeFps={setVisualizerFps}
        audioBitrate={audioBitrate}
        onChangeBitrate={setAudioBitrate}
      />
    </div>
  );
}
