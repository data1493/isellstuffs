// Shared live snapshot. Two players on ?crowd=1 reuse one read for this long.
// The acting player does not wait on it: a successful post carries the room.
export const LIVE_CACHE_MS = 30_000;
export const CROWD_POLL_MS = 2_000;

export function liveCacheControl() {
  const shared = Math.round(LIVE_CACHE_MS / 1000);
  const browser = Math.round(CROWD_POLL_MS / 1000);
  return `public, s-maxage=${shared}, max-age=${browser}`;
}

export function createLiveCache(windowMs = LIVE_CACHE_MS) {
  let entry = null;
  return {
    get(now) {
      if (!entry) return null;
      if (now - entry.at >= windowMs) return null;
      return entry.body;
    },
    set(now, body) {
      entry = { at: now, body };
    },
    clear() {
      entry = null;
    },
  };
}

export async function serveCachedLive({ cache, now, load }) {
  const hit = cache.get(now);
  if (hit) return { cached: true, result: hit };
  const result = await load();
  if (result?.status === 200) cache.set(now, result);
  return { cached: false, result };
}
