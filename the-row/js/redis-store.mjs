import { randomBytes } from "node:crypto";
import { hardenBook } from "./accounts.mjs";
import { fillRoom } from "./crowd.mjs";
import { seedRoom } from "./room.mjs";
import { advanceLive } from "./live-clock.mjs";

const BOOK = "row:book";
const LIVE = "row:live";
const LOCK = "row:lock";
const LOCK_WAIT_MS = 2500;
const LOCK_TTL_MS = 8000;

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function bookFrom(raw) {
  const value = typeof raw === "string" ? parseJson(raw) : raw;
  return {
    users: Array.isArray(value?.users) ? value.users : [],
    sessions: Array.isArray(value?.sessions) ? value.sessions : [],
  };
}

function liveFrom(raw, crowd, now) {
  const value = typeof raw === "string" ? parseJson(raw) : raw;
  if (value?.state?.pile && value.state.drop && Array.isArray(value.state.people) && value.state.people.length) {
    return {
      state: value.state,
      beat: Number(value.beat) || 0,
      tickAt: Number.isFinite(Number(value.tickAt)) ? Number(value.tickAt) : now,
    };
  }
  return {
    state: crowd ? fillRoom() : seedRoom(),
    beat: 0,
    tickAt: now,
  };
}

function parseJson(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function createRedisStore({ redis, crowd = false, now = Date.now } = {}) {
  if (!redis) throw new Error("Upstash Redis is not configured.");

  async function unlock(token) {
    const current = await redis.get(LOCK);
    if (current === token) await redis.del(LOCK);
  }

  async function locked(fn) {
    const token = randomBytes(16).toString("hex");
    const deadline = Date.now() + LOCK_WAIT_MS;
    let acquired = false;
    while (Date.now() < deadline) {
      const result = await redis.set(LOCK, token, { nx: true, px: LOCK_TTL_MS });
      if (result === "OK") {
        acquired = true;
        break;
      }
      await delay(40);
    }
    if (!acquired) {
      const error = new Error("The room is busy.");
      error.code = "BUSY";
      throw error;
    }
    try {
      return await fn();
    } finally {
      try {
        await unlock(token);
      } catch (error) {
        console.error(error instanceof Error ? error.message : "lock");
      }
    }
  }

  async function loadBook() {
    const book = bookFrom(await redis.get(BOOK));
    if (hardenBook(book)) await redis.set(BOOK, book);
    return book;
  }

  return {
    transact(fn) {
      return locked(async () => {
        const at = now();
        const book = await loadBook();
        const loaded = liveFrom(await redis.get(LIVE), crowd, at);
        const advanced = advanceLive(loaded, at, crowd);
        let nextBook = null;
        let nextLive = advanced.changed ? advanced.live : null;
        const result = await fn({
          book,
          live: advanced.live,
          saveBook(value) {
            nextBook = value;
          },
          saveLive(value) {
            nextLive = value;
          },
        });
        if (nextLive) await redis.set(LIVE, nextLive);
        if (nextBook) await redis.set(BOOK, nextBook);
        return result;
      });
    },
  };
}

export function redisOptionsFromEnv(env = process.env) {
  const url = env.UPSTASH_REDIS_REST_URL || env.KV_REST_API_URL || "";
  const token = env.UPSTASH_REDIS_REST_TOKEN || env.KV_REST_API_TOKEN || "";
  if (!url || !token) return null;
  return { url, token };
}
