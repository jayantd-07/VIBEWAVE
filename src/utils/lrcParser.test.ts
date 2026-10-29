import test from 'node:test';
import assert from 'node:assert/strict';
import { parseLrc, findActiveLyricIndex, formatTime } from './lrcParser';

test('parseLrc correctly parses standard LRC format with millisecond timestamps', () => {
  const lrc = `
    [ti:Cyber Dream]
    [ar:Neon Wave]
    [00:04.20] In the neon glow of midnight streets
    [00:08.50] Heartbeat racing to the heavy beats
    [00:15.00] Echoes in the cyber space
  `;

  const parsed = parseLrc(lrc);
  assert.equal(parsed.length, 3);
  assert.equal(parsed[0].time, 4.2);
  assert.equal(parsed[0].text, 'In the neon glow of midnight streets');
  assert.equal(parsed[1].time, 8.5);
  assert.equal(parsed[2].time, 15);
  assert.equal(parsed[0].duration, 4.3); // 8.5 - 4.2
});

test('parseLrc handles lines with multiple timestamps', () => {
  const lrc = `[00:01.00][00:05.00] Repeated chorus hook`;
  const parsed = parseLrc(lrc);
  assert.equal(parsed.length, 2);
  assert.equal(parsed[0].time, 1.0);
  assert.equal(parsed[1].time, 5.0);
  assert.equal(parsed[0].text, 'Repeated chorus hook');
  assert.equal(parsed[1].text, 'Repeated chorus hook');
});

test('findActiveLyricIndex identifies correct active line', () => {
  const lyrics = [
    { id: '1', time: 5.0, text: 'First line' },
    { id: '2', time: 10.0, text: 'Second line' },
    { id: '3', time: 15.0, text: 'Third line' },
  ];

  assert.equal(findActiveLyricIndex(lyrics, 0.0), -1);
  assert.equal(findActiveLyricIndex(lyrics, 4.9), -1);
  assert.equal(findActiveLyricIndex(lyrics, 5.0), 0);
  assert.equal(findActiveLyricIndex(lyrics, 7.5), 0);
  assert.equal(findActiveLyricIndex(lyrics, 10.0), 1);
  assert.equal(findActiveLyricIndex(lyrics, 14.9), 1);
  assert.equal(findActiveLyricIndex(lyrics, 20.0), 2);
});

test('formatTime outputs formatted mm:ss', () => {
  assert.equal(formatTime(0), '0:00');
  assert.equal(formatTime(65), '1:05');
  assert.equal(formatTime(125.4), '2:05');
  assert.equal(formatTime(-5), '0:00');
});
