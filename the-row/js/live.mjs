import { revive } from "./room.mjs";

export function crowdOn() {
  return new URLSearchParams(location.search).get("crowd") === "1";
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

export function watchCrowd(apply) {
  if (!crowdOn()) return;
  keepCrowdLinks();
  let last = "";
  const pull = async () => {
    try {
      const res = await fetch(`/live.json?t=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) return;
      const text = await res.text();
      if (!text || text === last) return;
      last = text;
      apply(revive(JSON.parse(text)));
    } catch {
      // The next pull tries again. The room stays on the last good frame.
    }
  };
  pull();
  setInterval(pull, 800);
}
