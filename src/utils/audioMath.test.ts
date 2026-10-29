import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateRms, extractFrequencyBands, BeatTracker } from './audioMath';

test('calculateRms computes near zero on silent signal', () => {
  const silent = new Uint8Array(128).fill(128); // 128 is center (0V in Uint8)
  const rms = calculateRms(silent);
  assert.equal(rms, 0);
});

test('calculateRms computes high value on full swing wave', () => {
  const wave = new Uint8Array(128);
  for (let i = 0; i < wave.length; i++) {
    wave[i] = i % 2 === 0 ? 0 : 255;
  }
  const rms = calculateRms(wave);
  assert.ok(rms > 0.8, `RMS expected > 0.8, got ${rms}`);
});

test('extractFrequencyBands parses 5 bands correctly', () => {
  const freqData = new Uint8Array(1024).fill(128);
  const bands = extractFrequencyBands(freqData, 44100);

  assert.ok(bands.bass >= 0 && bands.bass <= 1);
  assert.ok(bands.mid >= 0 && bands.mid <= 1);
  assert.ok(bands.treble >= 0 && bands.treble <= 1);
  assert.ok(bands.energy > 0);
});

test('BeatTracker registers beat on sudden bass surge', () => {
  const tracker = new BeatTracker();

  // Low level
  const r1 = tracker.detect(0.1, 1000);
  assert.equal(r1.isBeat, false);

  // Sharp bass spike
  const r2 = tracker.detect(0.85, 1400);
  assert.equal(r2.isBeat, true);

  // Immediate subsequent low
  const r3 = tracker.detect(0.2, 1450);
  assert.equal(r3.isBeat, false);
});
