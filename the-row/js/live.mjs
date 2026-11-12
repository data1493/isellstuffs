import { houseBeat } from "./house.mjs";
import { BEAT_MS } from "./live-clock.mjs";
import { CROWD_POLL_MS } from "./live-read.mjs";
import { revive } from "./room.mjs?v=6";

let crowdLive = true;
let crowdTimer = 0;
let lastBeat = -1;

export function noteCrowdBeat(beat) {
  const n = Number(beat);
  if (!Number.isFinite(n)) return;
  if (n > lastBeat) lastBeat = n;
}

export function postedRoom(result) {
  if (!result?.room) return null;
  noteCrowdBeat(result.room.beat);
  return result.room;
}

export function crowdOn() {
  return new URLSearchParams(location.search).get("crowd") === "1" && crowdLive;
}

export function keepCrowdLinks() {
  if (!crowdOn()) return;
  for (const link of document.querySelectorAll("a[href]")) {
    const url = new URL(link.getAttribute("href"), location.href);
    if (url.origin !== location.origin) continue;
    url.searchParams.set("crowd", "1");
    link.href = `${url.pathname}${url.search}${url.hash}`;
  }
}

export function watchHouse(pull, push) {
  if (new URLSearchParams(location.search).get("crowd") === "1") return;
  let beat = 0;
  const step = () => {
    const next = houseBeat(pull(), beat, Date.now());
    beat = next.beat;
    push(next.state);
  };
  step();
  setInterval(step, BEAT_MS);
}

export function watchCrowd(apply) {
  if (new URLSearchParams(location.search).get("crowd") !== "1") return;
  keepCrowdLinks();
  let last = "";
  let stopped = false;
  const pull = async () => {
    if (stopped) return;
    try {
      const res = await fetch("/live.json");
      if (!res.ok || stopped) return;
      const text = await res.text();
      const raw = JSON.parse(text);
      if (raw && raw.beating === false) {
        stopped = true;
        crowdLive = false;
        clearInterval(crowdTimer);
        apply(null);
        return;
      }
      if (!text || text === last || stopped) return;
      const beat = Number(raw.beat) || 0;
      if (beat < lastBeat) return;
      lastBeat = beat;
      last = text;
      const next = revive(raw);
      next.beat = beat;
      apply(next);
    } catch {
      // The next pull tries again. The room stays on the last good frame.
    }
  };
  pull();
  crowdTimer = setInterval(pull, CROWD_POLL_MS);
}
