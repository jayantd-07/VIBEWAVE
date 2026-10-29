import React, { useState } from 'react';
import { X, Terminal, Smartphone, Laptop, Copy, Check, Sparkles } from 'lucide-react';

interface DevGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DevGuideModal: React.FC<DevGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const steps = [
    {
      title: '1. Run in VS Code on your PC/Laptop',
      description: 'Open the project folder in VS Code, install dependencies, and launch the dev server:',
      command: `git clone <your-repo> vibewave
cd vibewave
npm install
npm run dev`,
      note: 'Open http://localhost:3000 in Chrome or Edge. Audio synthesis, Web Audio analysis, and offline caching work 100% locally!',
    },
    {
      title: '2. Production Build for High Performance',
      description: 'Generate an optimized, minified bundle with hardware-accelerated Canvas:',
      command: `npm run build
npm run preview`,
      note: 'Production build is bundled in /dist folder with zero lag and 60 FPS visualizer optimization.',
    },
    {
      title: '3. Build Android APK for your Mobile Phone (Capacitor)',
      description: 'Convert this web app into a real native Android APK for local testing without publishing to Google Play Store:',
      command: `# Step A: Install Capacitor Android tools
npm install @capacitor/core @capacitor/cli @capacitor/android

# Step B: Initialize Capacitor configuration
npx cap init Vibewave com.vibewave.player --web-dir dist

# Step C: Build web app and add Android project
npm run build
npx cap add android

# Step D: Sync & Open in Android Studio
npx cap sync
npx cap open android`,
      note: 'Inside Android Studio: Click "Build" -> "Build Bundle(s) / APK(s)" -> "Build APK(s)". Transfer the .apk to your Android phone via USB or WhatsApp/Drive and install it directly!',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-3xl max-h-[90vh] bg-[#0c0e18] border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                VS Code & Android APK Guide
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Local Device
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Step-by-step essentials to run locally on your laptop and generate an APK for your Android phone
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-6">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="bg-white/5 border border-white/5 rounded-2xl p-5 flex flex-col gap-3 relative group"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs flex items-center justify-center font-mono">
                    {idx + 1}
                  </span>
                  {step.title}
                </h4>

                <button
                  onClick={() => copyToClipboard(step.command, idx)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-800/40 transition-all cursor-pointer"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Commands</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-slate-400">{step.description}</p>

              {/* Terminal Code Snippet */}
              <div className="bg-[#05060a] border border-white/10 rounded-xl p-3 font-mono text-xs text-emerald-400 overflow-x-auto whitespace-pre">
                {step.command}
              </div>

              {/* Note */}
              <div className="text-[11px] text-slate-400 flex items-start gap-1.5 bg-black/30 p-2.5 rounded-lg border border-white/5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>{step.note}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-slate-400 border-t border-white/5 pt-4">
          <span className="flex items-center gap-1.5 font-mono text-[11px]">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            No Play Store publishing required • Pure local testing
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-white font-medium bg-cyan-600 hover:bg-cyan-500 transition-all cursor-pointer shadow-lg"
          >
            Got it, Let's Play
          </button>
        </div>
      </div>
    </div>
  );
};
