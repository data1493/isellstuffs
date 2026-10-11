import { houseBeat } from "./house.mjs";
import { BEAT_MS } from "./live-clock.mjs";
import { revive } from "./room.mjs?v=6";

let crowdLive = true;
let crowdTimer = 0;

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
      const res = await fetch(`/live.json?t=${Date.now()}`, { cache: "no-store" });
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
      last = text;
      apply(revive(raw));
    } catch {
      // The next pull tries again. The room stays on the last good frame.
    }
  };
  pull();
  crowdTimer = setInterval(pull, 800);
}
