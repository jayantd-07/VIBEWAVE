import test from 'node:test';
import assert from 'node:assert/strict';
import { estimateMood, MOOD_CONFIGS } from './moodClassifier';

test('MOOD_CONFIGS contains all 10 requested moods with valid palette', () => {
  const expectedMoods = [
    'Happy',
    'Sad',
    'Romantic',
    'Calm',
    'Energetic',
    'Dark',
    'Dreamy',
    'Nostalgic',
    'Cinematic',
    'Focus',
  ];

  for (const mood of expectedMoods) {
    const config = MOOD_CONFIGS[mood as keyof typeof MOOD_CONFIGS];
    assert.ok(config, `Missing mood configuration for ${mood}`);
    assert.ok(config.colors.primary, `Primary color missing for ${mood}`);
    assert.ok(config.colors.secondary, `Secondary color missing for ${mood}`);
    assert.ok(config.colors.glow, `Glow color missing for ${mood}`);
    assert.ok(config.particleCount > 0, `Particle count should be > 0 for ${mood}`);
  }
});

test('estimateMood classifies high tempo energetic track with keywords', () => {
  const result = estimateMood(
    { energy: 0.85, bass: 0.8, treble: 0.6, bpmEstimate: 140 },
    'Electric fire igniting the night with wild pulse and rhythm',
    140
  );

  assert.equal(result.mood, 'Energetic');
  assert.ok(result.confidence >= 55 && result.confidence <= 100);
});

test('estimateMood identifies calm meditative sentiment', () => {
  const result = estimateMood(
    { energy: 0.2, bass: 0.2, treble: 0.3, bpmEstimate: 70 },
    'Breathe in the gentle ocean waves, quiet peace and still tranquility',
    70
  );

  assert.equal(result.mood, 'Calm');
  assert.ok(result.confidence >= 55);
});
