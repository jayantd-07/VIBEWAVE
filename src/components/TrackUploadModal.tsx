import React, { useState, useRef } from 'react';
import { X, UploadCloud, Music, FileText, Check, AlertCircle } from 'lucide-react';
import { Track, MoodType } from '../types';
import { parseLrc } from '../utils/lrcParser';
import { estimateMood, MOOD_CONFIGS } from '../utils/moodClassifier';

interface TrackUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTrack: (track: Track) => void;
  currentMood: MoodType;
}

export const TrackUploadModal: React.FC<TrackUploadModalProps> = ({
  isOpen,
  onClose,
  onAddTrack,
  currentMood,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [mood, setMood] = useState<MoodType>('Energetic');
  const [lyricsText, setLyricsText] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const lrcInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processAudioFile = (f: File) => {
    if (!f.type.startsWith('audio/') && !f.name.match(/\.(mp3|wav|ogg|flac|m4a|aac)$/i)) {
      setErrorMsg('Please select a valid audio file (.mp3, .wav, .ogg, .flac, .m4a)');
      return;
    }

    setErrorMsg('');
    setFile(f);

    // Auto extract title & artist from filename
    const cleanName = f.name.replace(/\.[^/.]+$/, '');
    const parts = cleanName.split(' - ');
    if (parts.length >= 2) {
      setArtist(parts[0].trim());
      setTitle(parts.slice(1).join(' - ').trim());
    } else {
      setTitle(cleanName);
      setArtist('Local Artist');
    }

    // Auto guess mood from filename
    const moodGuess = estimateMood(undefined, f.name, 120);
    setMood(moodGuess.mood);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processAudioFile(e.dataTransfer.files[0]);
    }
  };

  const handleLrcUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const lrcFile = e.target.files?.[0];
    if (lrcFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setLyricsText(text);
      };
      reader.readAsText(lrcFile);
    }
  };

  const handleSubmit = () => {
    if (!file) {
      setErrorMsg('Please select an audio file first.');
      return;
    }

    const audioUrl = URL.createObjectURL(file);
    const parsedLyrics = lyricsText ? parseLrc(lyricsText) : [];

    // Simple cover artwork placeholder with mood gradients
    const coverUrl =
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80';

    const newTrack: Track = {
      id: `custom-${Date.now()}`,
      title: title.trim() || file.name,
      artist: artist.trim() || 'Unknown Artist',
      album: 'Local Uploads',
      duration: 180, // will be updated dynamically on loadedmetadata
      audioUrl,
      coverUrl,
      mood,
      bpm: 120,
      genre: 'User Import',
      bitDepth: 'Lossless',
      sampleRate: '48 kHz',
      format: file.name.split('.').pop()?.toUpperCase() || 'AUDIO',
      isHiFi: true,
      isCustom: true,
      lyrics: parsedLyrics,
      rawLyricsText: lyricsText,
      dateAdded: Date.now(),
    };

    onAddTrack(newTrack);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-xl bg-[#0e111c] border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Import Audio & Lyrics</h3>
              <p className="text-xs text-slate-400">Play local files with full audio visualization and synced lyrics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Drag & Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
            dragActive
              ? 'border-cyan-400 bg-cyan-500/10 scale-[1.01]'
              : file
              ? 'border-emerald-500/50 bg-emerald-500/5'
              : 'border-white/10 hover:border-white/20 bg-white/5'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,.mp3,.wav,.ogg,.flac,.m4a"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) processAudioFile(e.target.files[0]);
            }}
          />

          {file ? (
            <div className="flex items-center gap-3 text-emerald-400">
              <Music className="w-6 h-6" />
              <div className="text-left">
                <span className="text-xs font-semibold block text-white">{file.name}</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {(file.size / 1024 / 1024).toFixed(2)} MB • Ready
                </span>
              </div>
            </div>
          ) : (
            <>
              <UploadCloud className="w-8 h-8 text-cyan-400 mb-1" />
              <p className="text-xs font-semibold text-white">Drag & drop your song here, or browse</p>
              <p className="text-[10px] text-slate-500 font-mono">Supports MP3, WAV, FLAC, OGG, M4A</p>
            </>
          )}
        </div>

        {/* Metadata Inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">Song Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Midnight Drive"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50"
            />
          </div>
          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">Artist Name</label>
            <input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="e.g. Nova Wave"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50"
            />
          </div>
        </div>

        {/* Mood Selection */}
        <div>
          <label className="text-[11px] font-mono text-slate-400 block mb-1">Initial Mood Atmosphere</label>
          <select
            value={mood}
            onChange={(e) => setMood(e.target.value as MoodType)}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
          >
            {(Object.keys(MOOD_CONFIGS) as MoodType[]).map((m) => (
              <option key={m} value={m} className="bg-[#10131f]">
                {m} - {MOOD_CONFIGS[m].description}
              </option>
            ))}
          </select>
        </div>

        {/* Lyrics File or Text */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-mono text-slate-400">Optional Synced Lyrics (.lrc or text)</label>
            <button
              onClick={() => lrcInputRef.current?.click()}
              className="text-[10px] text-cyan-400 hover:underline cursor-pointer flex items-center gap-1"
            >
              <FileText className="w-3 h-3" />
              <span>Import .lrc file</span>
            </button>
            <input
              ref={lrcInputRef}
              type="file"
              accept=".lrc,.txt"
              className="hidden"
              onChange={handleLrcUpload}
            />
          </div>
          <textarea
            value={lyricsText}
            onChange={(e) => setLyricsText(e.target.value)}
            placeholder="[00:10.00] In the dark of the night... (or paste text)"
            className="w-full h-20 bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs font-mono text-slate-200 outline-none focus:border-cyan-500/50 resize-none"
          />
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 transition-all cursor-pointer shadow-lg shadow-cyan-950/50 flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Add to Player & Play</span>
          </button>
        </div>
      </div>
    </div>
  );
};
