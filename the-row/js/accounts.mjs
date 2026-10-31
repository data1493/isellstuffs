import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { CATALOG, armLane, enterLine, focusDrop, handleKey, pileOn, resetPile, revive, seatHandle, seatYou, seedRoom, tapLane, voteLine } from "./room.mjs";
import { CAST } from "./crowd.mjs";

const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";
const YEAR_MS = 365 * 24 * 60 * 60 * 1000;
// The book rides in the one Blob document every request rewrites (F-04), so it
// must stay small: about 280 bytes per kept name before personal rounds.
export const ACCOUNT_CAP = 300;
export const SESSION_CAP = 5;

export function emptyBook() {
  return { users: [], sessions: [] };
}

export function cleanKey(raw) {
  return String(raw ?? "").trim().toLowerCase().replace(/\s+/g, "");
}

export function makeToken() {
  return randomBytes(24).toString("base64url");
}

export function makeKey(random = Math.random) {
  let out = "";
  for (let i = 0; i < 6; i += 1) out += ALPHABET[Math.floor(random() * ALPHABET.length)];
  return `${out.slice(0, 3)}-${out.slice(3)}`;
}

function live(book, token, now) {
  if (!token) return null;
  const session = book.sessions.find((item) => item.token === token && item.expires > now);
  if (!session) return null;
  const user = book.users.find((item) => item.id === session.userId);
  if (!user) return null;
  return { session, user };
}

function prune(book, now) {
  book.sessions = book.sessions.filter((item) => item.expires > now);
  return book;
}

function addSession(book, session) {
  const mine = book.sessions.filter((item) => item.userId === session.userId);
  const drop = new Set(mine.slice(0, Math.max(0, mine.length - SESSION_CAP + 1)));
  book.sessions = [...book.sessions.filter((item) => !drop.has(item)), session];
}

function present(user, plainKey) {
  const view = {
    handle: user.handle,
    streak: user.streak || 0,
    wins: user.wins || 0,
    losses: user.losses || 0,
    dropsKept: user.dropsKept || 0,
    prizes: Array.isArray(user.prizes) ? user.prizes.filter((id) => CATALOG.some((item) => item.id === id)) : [],
  };
  if (typeof plainKey === "string" && plainKey) view.key = plainKey;
  return view;
}

function sealKey(plain) {
  const salt = randomBytes(16);
  const hash = scryptSync(plain, salt, 32);
  return { keySalt: salt.toString("base64url"), keyHash: hash.toString("base64url") };
}

function keyMatches(user, plain) {
  if (!plain || !user?.keyHash || !user?.keySalt) return false;
  try {
    const expected = Buffer.from(user.keyHash, "base64url");
    const actual = scryptSync(plain, Buffer.from(user.keySalt, "base64url"), expected.length);
    if (actual.length !== expected.length) return false;
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

export function hardenBook(book) {
  let changed = false;
  for (const user of book.users || []) {
    const plain = typeof user.key === "string" ? cleanKey(user.key) : "";
    if (plain && !user.keyHash) {
      const sealed = sealKey(plain);
      user.keySalt = sealed.keySalt;
      user.keyHash = sealed.keyHash;
      delete user.key;
      changed = true;
    } else if ("key" in user) {
      delete user.key;
      changed = true;
    }
  }
  return changed;
}

function personalRoom(handle) {
  const room = seedRoom();
  const link = `https://${handle}.room`;
  room.you = { handle, link };
  room.people = [{ handle, link }, ...room.people.filter((person) => person.handle !== handle)];
  return seatYou(room);
}

function loadPersonal(user) {
  const handle = user.handle;
  const link = `https://${handle}.room`;
  const room = user.round ? revive(user.round) : personalRoom(handle);
  room.you = { handle, link };
  if (!room.people.some((person) => person.handle === handle)) {
    room.people = [{ handle, link }, ...room.people];
  }
  const pile = room.pile || {};
  const open = pile.status === "open" && !pile.game && (pile.leftScore || 0) + (pile.rightScore || 0) === 0;
  return open ? seatYou(room) : room;
}

function applyMove(state, input) {
  if (input.kind === "reset") return resetPile(state);
  if (input.kind === "arm") return armLane(state, input.mark);
  if (input.kind === "pile") return pileOn(state, input.side);
  if (input.kind === "line") return enterLine(state, input.side, input.text);
  if (input.kind === "vote") return voteLine(state, input.side);
  if (input.kind === "tap") return tapLane(state, input.side, input.spot);
  return { ok: false, state, error: "Pick a move." };
}

function addPrize(user, id) {
  if (!CATALOG.some((item) => item.id === id)) return;
  const prizes = Array.isArray(user.prizes) ? user.prizes.filter((item) => CATALOG.some((drop) => drop.id === item)) : [];
  if (!prizes.includes(id)) user.prizes = [...prizes, id];
}

function creditUser(user, state, now) {
  const winner = seatHandle(state, state.pile.winner);
  const loser = seatHandle(state, state.pile.winner === "left" ? "right" : "left");
  if (user.handle === winner) {
    user.wins = (user.wins || 0) + 1;
    user.streak = (user.streak || 0) + 1;
    user.streakAt = now;
    if (state.drop?.holder === winner) {
      user.dropsKept = (user.dropsKept || 0) + 1;
      addPrize(user, state.drop.id);
    }
    return true;
  }
  if (user.handle !== loser) return false;
  user.losses = (user.losses || 0) + 1;
  user.streak = 0;
  user.streakAt = now;
  return true;
}

export function recordRound(book, input, now = Date.now()) {
  const next = structuredClone(book);
  const winner = handleKey(input?.winner);
  const loser = handleKey(input?.loser);
  let wrote = false;
  const userFor = (handle) => (handle ? next.users.find((user) => user.handle === handle) : null);
  const winnerUser = userFor(winner);
  if (winnerUser) {
    wrote = true;
    winnerUser.wins = (winnerUser.wins || 0) + 1;
    winnerUser.streak = (winnerUser.streak || 0) + 1;
    winnerUser.streakAt = now;
    if (input?.held) {
      winnerUser.dropsKept = (winnerUser.dropsKept || 0) + 1;
      addPrize(winnerUser, input.dropId);
    }
  }
  const loserUser = loser !== winner ? userFor(loser) : null;
  if (loserUser) {
    wrote = true;
    loserUser.losses = (loserUser.losses || 0) + 1;
    loserUser.streak = 0;
    loserUser.streakAt = now;
  }
  return { ok: wrote, book: next, wrote };
}

export function playRound(book, token, input, now = Date.now()) {
  const found = live(book, token, now);
  if (!found) return { ok: false, error: "Keep a name first.", book };
  const kind = input?.kind;
  if (kind !== "pile" && kind !== "vote" && kind !== "line" && kind !== "tap" && kind !== "reset" && kind !== "arm") {
    return { ok: false, error: "Pick a move.", book };
  }
  const next = structuredClone(book);
  const user = next.users.find((item) => item.id === found.user.id);
  const before = loadPersonal(user);
  let state = before;
  if (input.drop && state.drop?.id !== input.drop && state.pile?.status === "open") {
    const focused = focusDrop(state, input.drop);
    if (!focused.ok) return { ok: false, error: focused.error || "That drop isn’t on the floor.", book };
    state = focused.state;
  }
  const played = applyMove(state, input);
  if (!played.ok) return { ok: false, error: played.error || "Pick a move.", book };
  const wasWon = before.pile?.status === "won";
  user.round = played.state;
  const wrote = !wasWon && played.state.pile?.status === "won" && played.state.pile.winner
    ? creditUser(user, played.state, now)
    : false;
  return { ok: true, book: next, user: present(user), wrote };
}

export function readUser(book, token, now = Date.now()) {
  const found = live(book, token, now);
  return found ? present(found.user) : null;
}

export function actingHandle(book, token, requested, now = Date.now()) {
  const wanted = handleKey(requested);
  const session = readUser(book, token, now);
  if (!session) {
    if (wanted && book.users.some((user) => user.handle === wanted)) {
      return { ok: false, error: "That name is kept." };
    }
    return { ok: false, error: "Keep a name first." };
  }
  if (wanted && wanted !== session.handle) return { ok: false, error: "Play as your name." };
  if (CAST.includes(session.handle)) return { ok: false, error: "That seat isn't yours." };
  return { ok: true, handle: session.handle };
}

export function keepName(book, input, now = Date.now(), deps = {}) {
  const handle = handleKey(input?.handle);
  const next = prune(structuredClone(book), now);
  if (!handle) return { ok: false, error: "The room needs a name.", book: next };
  if (CAST.includes(handle)) return { ok: false, error: "That name is already in the room.", book: next };

  const owner = next.users.find((user) => user.handle === handle);
  const current = live(next, input?.token, now);
  if (owner && (!current || owner.id !== current.user.id)) {
    return { ok: false, error: "That name is kept.", book: next };
  }

  let user = current?.user;
  if (!user) {
    if (next.users.length >= ACCOUNT_CAP) return { ok: false, error: "The room has no names left.", book: next };
    const plain = cleanKey((deps.key || makeKey)());
    const sealed = sealKey(plain);
    user = {
      id: (deps.token || makeToken)(),
      handle,
      keySalt: sealed.keySalt,
      keyHash: sealed.keyHash,
      createdAt: now,
    };
    next.users.push(user);
    const token = (deps.token || makeToken)();
    addSession(next, { token, userId: user.id, expires: now + YEAR_MS });
    return { ok: true, book: next, token, user: present(user, plain) };
  }

  user.handle = handle;
  return { ok: true, book: next, token: current.session.token, user: present(user) };
}

export function loginName(book, input, now = Date.now(), deps = {}) {
  const handle = handleKey(input?.handle);
  const key = cleanKey(input?.key);
  const next = prune(structuredClone(book), now);
  const user = next.users.find((item) => item.handle === handle);
  if (!user || !keyMatches(user, key)) return { ok: false, error: "That key does not match.", book: next };
  const token = (deps.token || makeToken)();
  addSession(next, { token, userId: user.id, expires: now + YEAR_MS });
  return { ok: true, book: next, token, user: present(user, key) };
}

export function dropSession(book, token) {
  const next = structuredClone(book);
  next.sessions = next.sessions.filter((item) => item.token !== token);
  return next;
}
