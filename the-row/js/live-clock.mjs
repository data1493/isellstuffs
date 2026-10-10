import { crowdBeat } from "./crowd.mjs";

export const BEAT_MS = 2400;
export const MAX_CATCHUP = 12;

export function advanceLive(live, now, enabled) {
  if (!enabled) return { live, changed: false };
  const tickAt = Number(live?.tickAt);
  const started = Number.isFinite(tickAt) ? tickAt : now;
  const due = Math.floor((now - started) / BEAT_MS);
  if (due <= 0) return { live, changed: false };
  const steps = Math.min(due, MAX_CATCHUP);
  let state = live.state;
  let beat = Number(live.beat) || 0;
  for (let i = 0; i < steps; i += 1) {
    const stepped = crowdBeat(state, beat, started + (i + 1) * BEAT_MS);
    state = stepped.state;
    beat = stepped.beat;
  }
  const tickNext = due > steps ? now - ((now - started) % BEAT_MS) : started + steps * BEAT_MS;
  return { live: { state, beat, tickAt: tickNext }, changed: true };
}
