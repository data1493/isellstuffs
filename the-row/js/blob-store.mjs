import { hardenBook } from "./accounts.mjs";
import { houseRoom, isHouseRoom, realPlayers } from "./house.mjs";
import { seedRoom } from "./room.mjs";
import { advanceLive } from "./live-clock.mjs";

const ATTEMPTS = 6;

// Accounts are their own Blob document (row/accounts.json). The room document
// (row/state.json) is what a tick rewrites. Each document keeps its own etag
// compare-and-swap. A new account is written after the room create, so a lost
// room create does not leave a name behind. A win is written to the accounts
// document first; recordRound ignores a round id it already credited, so a
// lost room write can be retried without counting the win twice. An old
// state.json that still has a book is split on the first read. The accounts
// document is written before that book is removed.

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

export function conflictError(cause) {
  const error = new Error("The room changed.");
  error.code = "CONFLICT";
  if (cause instanceof Error) error.cause = cause;
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

function embeddedBook(roomValue) {
  if (!roomValue || typeof roomValue !== "object" || !roomValue.book || typeof roomValue.book !== "object") return null;
  return bookFrom(roomValue.book);
}

function storedBook(accountsValue) {
  if (!accountsValue || typeof accountsValue !== "object") return null;
  if (Array.isArray(accountsValue.users) || Array.isArray(accountsValue.sessions)) return bookFrom(accountsValue);
  if (accountsValue.book && typeof accountsValue.book === "object") return bookFrom(accountsValue.book);
  return null;
}

function liveReady(state) {
  return Boolean(state?.pile && state.drop && Array.isArray(state.people) && state.people.length);
}

function liveFrom(raw, crowd, now) {
  if (liveReady(raw?.live?.state)) {
    if ("beating" in raw.live.state) delete raw.live.state.beating;
    let state = raw.live.state;
    let migrated = false;
    if (crowd && realPlayers(state).length === 0 && !isHouseRoom(state)) {
      state = houseRoom();
      migrated = true;
    }
    return {
      state,
      beat: Number(raw.live.beat) || 0,
      tickAt: Number.isFinite(Number(raw.live.tickAt)) ? Number(raw.live.tickAt) : now,
      seeded: migrated,
    };
  }
  return {
    state: crowd ? houseRoom() : seedRoom(),
    beat: 0,
    tickAt: now,
    seeded: true,
  };
}

// roomValue is the state.json body. accountsValue is the accounts body, or
// null when that blob does not exist yet. lift means the book still has to
// be copied out. strip means state.json still carries a book key.
export function openDocuments(roomValue, accountsValue, crowd, now) {
  const room = typeof roomValue === "string" ? parseJson(roomValue) : roomValue;
  const accounts = typeof accountsValue === "string" ? parseJson(accountsValue) : accountsValue;
  const embedded = embeddedBook(room);
  const stored = storedBook(accounts);
  const embeddedCount = embedded ? embedded.users.length : 0;
  const storedCount = stored ? stored.users.length : 0;
  let book = bookFrom(null);
  let lift = false;
  if (stored && (storedCount > 0 || embeddedCount === 0)) {
    book = stored;
  } else if (embedded) {
    book = embedded;
    lift = true;
  }
  const strip = Boolean(room && typeof room === "object" && Object.prototype.hasOwnProperty.call(room, "book"));
  return {
    book,
    live: liveFrom(room, crowd, now),
    lift,
    strip,
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
    const current = (await read()) || {};
    const room = current.room || null;
    const accounts = current.accounts || null;
    const loaded = openDocuments(room ? room.value : null, accounts ? accounts.value : null, crowd, at);
    const hardened = hardenBook(loaded.book);
    const advanced = advanceLive(loaded.live, at, crowd);
    const freshRoom = !room;
    let nextBook = hardened || loaded.lift ? loaded.book : null;
    let nextLive = freshRoom || loaded.live.seeded || advanced.changed || loaded.strip ? advanced.live : null;
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
    const accountsWrite = nextBook ? { value: nextBook, etag: accounts?.etag || null } : null;
    const roomWrite = nextLive ? { value: { live: nextLive }, etag: room?.etag || null } : null;
    const creating = Boolean(accountsWrite && !accounts && !loaded.lift);
    if (creating && roomWrite) {
      await write("room", roomWrite.value, roomWrite.etag);
      await write("accounts", accountsWrite.value, accountsWrite.etag);
    } else {
      if (accountsWrite) await write("accounts", accountsWrite.value, accountsWrite.etag);
      if (roomWrite) await write("room", roomWrite.value, roomWrite.etag);
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
