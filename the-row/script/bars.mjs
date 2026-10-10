import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SR = 44100;
const BPM = 120;
const BARS = 4;
const BEAT = 60 / BPM;
const SECONDS = BARS * 4 * BEAT;

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function voice(event, t, rand) {
  if (event.kind === "kick") {
    const decay = 22;
    const low = 46;
    const high = 168;
    const phase = 2 * Math.PI * (low * t + ((high - low) * (1 - Math.exp(-decay * t))) / decay);
    return Math.sin(phase) * Math.exp(-t * 6.2);
  }
  if (event.kind === "hat") return (rand() * 2 - 1) * Math.exp(-t * 46);
  if (event.kind === "open") return (rand() * 2 - 1) * Math.exp(-t * 12);
  if (event.kind === "clap") return (rand() * 2 - 1) * Math.exp(-t * 16);
  if (event.kind === "rim") {
    return Math.sin(2 * Math.PI * 490 * t) * Math.exp(-t * 28) + (rand() * 2 - 1) * Math.exp(-t * 36) * 0.35;
  }
  if (event.kind === "bass") {
    const env = Math.exp(-t * 2.2);
    return Math.tanh(Math.sin(2 * Math.PI * event.note * t) * 1.7) * env;
  }
  if (event.kind === "ping") return Math.sin(2 * Math.PI * event.note * t) * Math.exp(-t * 5.5);
  if (event.kind === "stab") {
    const env = Math.exp(-t * 7);
    const chord = event.notes.reduce((sum, note) => sum + Math.sin(2 * Math.PI * note * t), 0);
    return (chord / event.notes.length) * env;
  }
  return 0;
}

function render(events, seed) {
  const length = Math.floor(SECONDS * SR);
  const samples = new Float32Array(length);
  const rand = mulberry32(seed);
  for (const event of events) {
    const start = Math.floor(event.beat * BEAT * SR);
    const span = Math.floor(event.dur * SR);
    for (let i = 0; i < span; i += 1) {
      const index = start + i;
      if (index >= length) break;
      samples[index] += voice(event, i / SR, rand) * event.gain;
    }
  }
  const fade = Math.floor(0.02 * SR);
  for (let i = 0; i < length; i += 1) {
    let gain = 1;
    if (i < fade) gain = i / fade;
    if (i > length - fade) gain = (length - i) / fade;
    samples[i] = Math.tanh(samples[i] * 1.35) * gain;
  }
  return samples;
}

function wav(samples) {
  const dataSize = samples.length * 2;
  const file = Buffer.alloc(44 + dataSize);
  file.write("RIFF", 0);
  file.writeUInt32LE(36 + dataSize, 4);
  file.write("WAVE", 8);
  file.write("fmt ", 12);
  file.writeUInt32LE(16, 16);
  file.writeUInt16LE(1, 20);
  file.writeUInt16LE(1, 22);
  file.writeUInt32LE(SR, 24);
  file.writeUInt32LE(SR * 2, 28);
  file.writeUInt16LE(2, 32);
  file.writeUInt16LE(16, 34);
  file.write("data", 36);
  file.writeUInt32LE(dataSize, 40);
  for (let i = 0; i < samples.length; i += 1) {
    const sample = Math.max(-1, Math.min(1, samples[i]));
    file.writeInt16LE(Math.round(sample * 32767), 44 + i * 2);
  }
  return file;
}

function night() {
  const events = [];
  for (let bar = 0; bar < BARS; bar += 1) {
    events.push({ beat: bar * 4, kind: "kick", dur: 0.42, gain: 0.92 });
    events.push({ beat: bar * 4 + 2, kind: "kick", dur: 0.3, gain: 0.48 });
    for (let step = 0; step < 8; step += 1) {
      events.push({ beat: bar * 4 + step * 0.5, kind: "hat", dur: 0.045, gain: step % 2 ? 0.16 : 0.07 });
    }
    events.push({ beat: bar * 4, kind: "bass", note: bar === 2 ? 49 : 55, dur: 1.7, gain: 0.62 });
    events.push({ beat: bar * 4 + 3, kind: "ping", note: 220, dur: 0.45, gain: 0.14 });
  }
  return events;
}

function bold() {
  const events = [];
  for (let bar = 0; bar < BARS; bar += 1) {
    for (let beat = 0; beat < 4; beat += 1) {
      const at = bar * 4 + beat;
      events.push({ beat: at, kind: "kick", dur: 0.36, gain: 0.9 });
      events.push({ beat: at, kind: "hat", dur: 0.04, gain: 0.1 });
      events.push({ beat: at + 0.5, kind: "hat", dur: 0.05, gain: 0.2 });
      events.push({ beat: at, kind: "bass", note: bar === 3 ? 82.4 : 41.2, dur: 0.24, gain: 0.5 });
      events.push({ beat: at + 0.5, kind: "bass", note: bar === 3 ? 82.4 : 41.2, dur: 0.18, gain: 0.32 });
    }
    events.push({ beat: bar * 4 + 1, kind: "clap", dur: 0.18, gain: 0.34 });
    events.push({ beat: bar * 4 + 3, kind: "clap", dur: 0.18, gain: 0.34 });
  }
  events.push({ beat: 0, kind: "stab", notes: [164.8, 196, 246.9], dur: 0.35, gain: 0.28 });
  events.push({ beat: 8, kind: "stab", notes: [164.8, 196, 246.9], dur: 0.35, gain: 0.28 });
  return events;
}

function drawer() {
  const notes = [65.4, 73.4, 87.3, 98];
  const events = [];
  for (let bar = 0; bar < BARS; bar += 1) {
    for (let beat = 0; beat < 4; beat += 1) {
      const at = bar * 4 + beat;
      events.push({ beat: at, kind: "kick", dur: 0.32, gain: 0.78 });
      events.push({ beat: at + 0.5, kind: "hat", dur: 0.04, gain: 0.22 });
      events.push({ beat: at, kind: "bass", note: notes[bar], dur: 0.42, gain: 0.48 });
    }
    events.push({ beat: bar * 4 + 1.5, kind: "open", dur: 0.16, gain: 0.2 });
    events.push({ beat: bar * 4 + 3.5, kind: "rim", dur: 0.08, gain: 0.28 });
  }
  return events;
}

function seat() {
  const events = [];
  for (let bar = 0; bar < BARS; bar += 1) {
    events.push({ beat: bar * 4, kind: "kick", dur: 0.34, gain: 0.7 });
    events.push({ beat: bar * 4 + 1.5, kind: "kick", dur: 0.22, gain: 0.4 });
    events.push({ beat: bar * 4 + 3, kind: "rim", dur: 0.09, gain: 0.32 });
    for (let step = 0; step < 8; step += 1) {
      events.push({ beat: bar * 4 + step * 0.5, kind: "hat", dur: 0.03, gain: 0.1 });
    }
    events.push({ beat: bar * 4, kind: "bass", note: 46.25, dur: 1.8, gain: 0.5 });
  }
  return events;
}

const songs = [
  ["j190.wav", night(), 190],
  ["bold.wav", bold(), 204],
  ["list.wav", drawer(), 404],
  ["stub.wav", seat(), 17],
];

const dir = join(dirname(fileURLToPath(import.meta.url)), "..", "audio");
await mkdir(dir, { recursive: true });
for (const [name, events, seed] of songs) {
  const file = wav(render(events, seed));
  await writeFile(join(dir, name), file);
  console.log(`${name} ${file.length} bytes`);
}
