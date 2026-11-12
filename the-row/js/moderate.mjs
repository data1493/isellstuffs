import { SHORT_SLURS, SLURS, URL_HOSTS, WORD_SLURS } from "./blocklist.mjs";

// Same cap say() and enterLine() already use.
export const TEXT_MAX = 80;
export const VIBE_MAX = TEXT_MAX;
export const LINE_MAX = TEXT_MAX;
export const VIBE_GAP_MS = 30_000;
export const LINE_CAP = 4;

const CONTROL = /[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u2028\u2029\u202A-\u202E\u2060-\u206F\uFEFF]/g;
const REPEAT = /(.)\1{7,}/;
const MENTION = /@[a-z0-9._]{1,32}/gi;
const MENTION_CAP = 3;

function leet(text) {
  return text
    .replace(/0/g, "o")
    .replace(/1/g, "i")
    .replace(/3/g, "e")
    .replace(/4/g, "a")
    .replace(/5/g, "s");
}

function fold(text) {
  return leet(text.toLowerCase()).replace(/[^a-z]+/g, "");
}

function words(text) {
  return leet(text.toLowerCase()).replace(/[^a-z0-9]+/g, " ").trim().split(/\s+/).filter(Boolean);
}

export function cleanPublicText(raw) {
  if (raw != null && typeof raw !== "string") return "";
  return String(raw ?? "").replace(CONTROL, "").replace(/\s+/g, " ").trim();
}

export function screenPublicText(raw, max = TEXT_MAX) {
  const text = cleanPublicText(raw);
  if (!text) return { ok: false, status: 400, error: "Say something." };
  if (text.length > max) return { ok: false, status: 400, error: "Keep it to one line." };
  const flat = fold(text);
  if (SLURS.some((term) => flat.includes(term))) {
    return { ok: false, status: 400, error: "That line can't go up." };
  }
  const tokens = words(text);
  const listed = [...WORD_SLURS, ...SHORT_SLURS];
  if (listed.some((term) => tokens.includes(term))) {
    return { ok: false, status: 400, error: "That line can't go up." };
  }
  if (/https?:\/\//i.test(text) || /\bwww\./i.test(text)) {
    return { ok: false, status: 400, error: "Links stay off the wall." };
  }
  const host = URL_HOSTS.join("|");
  if (new RegExp(`\\b[a-z0-9-]+\\.(?:${host})\\b`, "i").test(text)) {
    return { ok: false, status: 400, error: "Links stay off the wall." };
  }
  const mentions = text.match(MENTION) || [];
  if (mentions.length > MENTION_CAP) {
    return { ok: false, status: 400, error: "Too many @s." };
  }
  if (REPEAT.test(text)) {
    return { ok: false, status: 400, error: "Ease off the repeats." };
  }
  return { ok: true, text };
}

export function roundKey(state) {
  return Number(state?.dealt) || 0;
}

function liveSession(book, token, now) {
  return (book?.sessions || []).find((item) => item.token === token && item.expires > now) || null;
}

export function vibeReady(book, token, at) {
  const session = liveSession(book, token, at);
  if (!session) return { ok: false, status: 400, error: "Keep a name first." };
  if (session.vibeAt && at - session.vibeAt < VIBE_GAP_MS) {
    return { ok: false, status: 429, error: "The wall needs a breath." };
  }
  return { ok: true };
}

export function lineReady(book, token, state, at) {
  const session = liveSession(book, token, at);
  if (!session) return { ok: false, status: 400, error: "Keep a name first." };
  const key = roundKey(state);
  const count = session.lineRound === key ? Number(session.lineCount) || 0 : 0;
  if (count >= LINE_CAP) {
    return { ok: false, status: 429, error: "That's enough lines this round." };
  }
  return { ok: true };
}

export function rememberVibe(book, token, at) {
  const next = structuredClone(book);
  const session = next.sessions.find((item) => item.token === token);
  if (session) session.vibeAt = at;
  return next;
}

export function rememberLine(book, token, state) {
  const next = structuredClone(book);
  const session = next.sessions.find((item) => item.token === token);
  if (!session) return next;
  const key = roundKey(state);
  if (session.lineRound !== key) {
    session.lineRound = key;
    session.lineCount = 0;
  }
  session.lineCount = (Number(session.lineCount) || 0) + 1;
  return next;
}
