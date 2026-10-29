/**
 * Computes Root-Mean-Square (RMS) loudness from normalized time-domain data (range 0..255)
 */
export function calculateRms(timeDomainData: Uint8Array): number {
  if (!timeDomainData || timeDomainData.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < timeDomainData.length; i++) {
    // Convert 0..255 to -1.0 .. +1.0
    const sample = (timeDomainData[i] - 128) / 128;
    sum += sample * sample;
  }
  return Math.min(1, Math.sqrt(sum / timeDomainData.length) * 2.2);
}

/**
 * Splits frequency data into 5 core acoustic bands (Bass, Low-Mid, Mid, High-Mid, Treble)
 */
export function extractFrequencyBands(freqData: Uint8Array, sampleRate = 44100) {
  if (!freqData || freqData.length === 0) {
    return { bass: 0, lowMid: 0, mid: 0, highMid: 0, treble: 0, energy: 0 };
  }

  const binCount = freqData.length;
  const hzPerBin = (sampleRate / 2) / binCount;

  let bassSum = 0, bassCount = 0;
  let lowMidSum = 0, lowMidCount = 0;
  let midSum = 0, midCount = 0;
  let highMidSum = 0, highMidCount = 0;
  let trebleSum = 0, trebleCount = 0;
  let totalSum = 0;

  for (let i = 0; i < binCount; i++) {
    const freq = i * hzPerBin;
    const val = freqData[i] / 255;
    totalSum += val;

    if (freq >= 20 && freq < 250) {
      bassSum += val;
      bassCount++;
    } else if (freq >= 250 && freq < 600) {
      lowMidSum += val;
      lowMidCount++;
    } else if (freq >= 600 && freq < 2200) {
      midSum += val;
      midCount++;
    } else if (freq >= 2200 && freq < 6500) {
      highMidSum += val;
      highMidCount++;
    } else if (freq >= 6500) {
      trebleSum += val;
      trebleCount++;
    }
  }

  return {
    bass: bassCount ? Math.min(1, (bassSum / bassCount) * 1.5) : 0,
    lowMid: lowMidCount ? Math.min(1, (lowMidSum / lowMidCount) * 1.4) : 0,
    mid: midCount ? Math.min(1, (midSum / midCount) * 1.6) : 0,
    highMid: highMidCount ? Math.min(1, (highMidSum / highMidCount) * 1.8) : 0,
    treble: trebleCount ? Math.min(1, (trebleSum / trebleCount) * 2.2) : 0,
    energy: Math.min(1, (totalSum / binCount) * 1.8),
  };
}

/**
 * Computes spectral centroid (brightness of the sound) in range 0..1
 */
export function calculateSpectralCentroid(freqData: Uint8Array): number {
  if (!freqData || freqData.length === 0) return 0;
  let weightedSum = 0;
  let totalMagnitude = 0;
  for (let i = 0; i < freqData.length; i++) {
    const mag = freqData[i];
    weightedSum += i * mag;
    totalMagnitude += mag;
  }
  if (totalMagnitude === 0) return 0;
  return Math.min(1, (weightedSum / totalMagnitude) / (freqData.length * 0.4));
}

/**
 * Adaptive beat detector state tracker
 */
export class BeatTracker {
  private threshold = 0.45;
  private decayRate = 0.96;
  private minInterval = 240; // ms minimum between beats (~250 BPM max)
  private lastBeatTime = 0;
  private beatIntervals: number[] = [];

  detect(bassEnergy: number, currentTimeMs: number): { isBeat: boolean; estimatedBpm: number } {
    let isBeat = false;

    if (
      bassEnergy > this.threshold &&
      bassEnergy > 0.4 &&
      currentTimeMs - this.lastBeatTime > this.minInterval
    ) {
      isBeat = true;
      const interval = currentTimeMs - this.lastBeatTime;
      this.lastBeatTime = currentTimeMs;

      // Track last 6 intervals to estimate BPM
      if (interval >= 300 && interval <= 1200) {
        this.beatIntervals.push(interval);
        if (this.beatIntervals.length > 6) {
          this.beatIntervals.shift();
        }
      }
      // Bump threshold on hit
      this.threshold = bassEnergy * 1.05;
    } else {
      // Natural decay towards baseline
      this.threshold = Math.max(0.28, this.threshold * this.decayRate);
    }

    let estimatedBpm = 120;
    if (this.beatIntervals.length >= 3) {
      const avgInterval =
        this.beatIntervals.reduce((a, b) => a + b, 0) / this.beatIntervals.length;
      estimatedBpm = Math.round(60000 / avgInterval);
    }

    return { isBeat, estimatedBpm };
  }
}
