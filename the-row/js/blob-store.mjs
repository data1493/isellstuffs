import { hardenBook } from "./accounts.mjs";
import { fillRoom } from "./crowd.mjs";
import { seedRoom } from "./room.mjs";
import { advanceLive } from "./live-clock.mjs";

const ATTEMPTS = 6;

// The book and the room share one private blob. put({ ifMatch }) is a
// compare-and-swap: a lost race throws, and the request reloads and reapplies.
// One object means a win cannot land in the room and miss the account, or the
// reverse. Blob has no lock, so every request may rewrite this small document,
// and a crowded moment can still fail after the retries. The function then
// answers "Down", which the pages already handle. Separate keys would let an
// account write pass a crowd write, so a win could be credited twice or dropped.

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function isConflict(error) {
  if (!error) return false;
  if (error.code === "CONFLICT") return true;
  if (error.name === "BlobPreconditionFailedError") return true;
  return /precondition|etag mismatch|already exists/i.test(String(error.message || ""));
}

export function conflictError() {
  const error = new Error("The room changed.");
  error.code = "CONFLICT";
  return error;
}

function parseJson(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function bookFrom(raw) {
  return {
    users: Array.isArray(raw?.users) ? raw.users : [],
    sessions: Array.isArray(raw?.sessions) ? raw.sessions : [],
  };
}

function liveReady(state) {
  return Boolean(state?.pile && state.drop && Array.isArray(state.people) && state.people.length);
}

function liveFrom(raw, crowd, now) {
  if (liveReady(raw?.state)) {
    if ("beating" in raw.state) delete raw.state.beating;
    return {
      state: raw.state,
      beat: Number(raw.beat) || 0,
      tickAt: Number.isFinite(Number(raw.tickAt)) ? Number(raw.tickAt) : now,
      seeded: false,
    };
  }
  return {
    state: crowd ? fillRoom() : seedRoom(),
    beat: 0,
    tickAt: now,
    seeded: true,
  };
}

function stateFrom(raw, crowd, now) {
  const value = typeof raw === "string" ? parseJson(raw) : raw;
  return {
    book: bookFrom(value?.book),
    live: liveFrom(value?.live, crowd, now),
  };
}

export function sameDocument(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

// A create has no etag. If the put fails and the blob is now a different
// document, someone else won the create and this request must reapply.
// If the stored document is the one we just wrote, the put landed and the
// response was the part that failed, so the request must not run again.
export function lostCreate(error, etag, written, current) {
  if (isConflict(error)) return "retry";
  if (etag || !current) return "fail";
  return sameDocument(current.value, written) ? "ok" : "retry";
}

export function createBlobStore({ read, write, crowd = false, now = Date.now, attempts = ATTEMPTS, wait = delay } = {}) {
  if (typeof read !== "function" || typeof write !== "function") {
    throw new Error("Vercel Blob is not configured.");
  }

  async function once(fn) {
    const at = now();
    const current = await read();
    const loaded = stateFrom(current?.value, crowd, at);
    const hardened = hardenBook(loaded.book);
    const advanced = advanceLive(loaded.live, at, crowd);
    const fresh = !current;
    let nextBook = hardened ? loaded.book : null;
    let nextLive = fresh || loaded.live.seeded || advanced.changed ? advanced.live : null;
    const result = await fn({
      book: loaded.book,
      live: advanced.live,
      saveBook(value) {
        nextBook = value;
      },
      saveLive(value) {
        nextLive = value;
      },
    });
    if (fresh || nextBook || nextLive) {
      await write({
        book: nextBook || loaded.book,
        live: nextLive || advanced.live,
      }, current?.etag || null);
    }
    return result;
  }

  return {
    async transact(fn) {
      let last;
      for (let attempt = 0; attempt < attempts; attempt += 1) {
        try {
          return await once(fn);
        } catch (error) {
          last = error;
          if (!isConflict(error) || attempt === attempts - 1) throw error;
          await wait(25 * (attempt + 1));
        }
      }
      throw last;
    },
  };
}
