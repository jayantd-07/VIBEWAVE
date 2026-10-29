import { LyricLine } from '../types';

/**
 * Parses standard LRC format strings: [mm:ss.xx] Lyric text
 * Supports multiple timestamps per line: [01:20.00][01:45.00] Repeated text
 */
export function parseLrc(lrcText: string): LyricLine[] {
  if (!lrcText || typeof lrcText !== 'string') return [];

  const lines = lrcText.split('\n');
  const result: LyricLine[] = [];
  const timeRegex = /\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/g;

  lines.forEach((line, lineIdx) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Skip metadata tags like [ti:Title], [ar:Artist], [al:Album]
    if (/^\[(ti|ar|al|by|offset|length|re|ve):/i.test(trimmed)) return;

    // Collect all timestamps in this line
    const timestamps: number[] = [];
    let match: RegExpExecArray | null;
    timeRegex.lastIndex = 0;

    while ((match = timeRegex.exec(trimmed)) !== null) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      let millis = 0;
      if (match[3]) {
        if (match[3].length === 1) millis = parseInt(match[3], 10) * 100;
        else if (match[3].length === 2) millis = parseInt(match[3], 10) * 10;
        else millis = parseInt(match[3].substring(0, 3), 10);
      }
      timestamps.push(minutes * 60 + seconds + millis / 1000);
    }

    if (timestamps.length === 0) return;

    // Remove timestamps from line to get text
    const text = trimmed.replace(/\[\d{1,2}:\d{2}(?:\.\d{1,3})?\]/g, '').trim();

    timestamps.forEach((time, tIdx) => {
      result.push({
        id: `lyric-${lineIdx}-${tIdx}`,
        time: Math.max(0, Math.round(time * 1000) / 1000),
        text: text || '♪',
      });
    });
  });

  // Sort chronologically
  result.sort((a, b) => a.time - b.time);

  // Compute duration per line
  for (let i = 0; i < result.length; i++) {
    if (i < result.length - 1) {
      result[i].duration = Math.max(0.5, result[i + 1].time - result[i].time);
    } else {
      result[i].duration = 4.0; // default 4 seconds for the final line
    }
  }

  return result;
}

/**
 * Finds the index of the currently active lyric line for the given timestamp
 */
export function findActiveLyricIndex(lyrics: LyricLine[], currentTime: number): number {
  if (!lyrics || lyrics.length === 0) return -1;
  if (currentTime < lyrics[0].time) return -1;

  let activeIndex = 0;
  for (let i = 0; i < lyrics.length; i++) {
    if (currentTime >= lyrics[i].time) {
      activeIndex = i;
    } else {
      break;
    }
  }
  return activeIndex;
}

/**
 * Converts seconds into mm:ss display
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}
