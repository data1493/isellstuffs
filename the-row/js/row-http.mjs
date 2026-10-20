import { actingHandle, dropSession, keepName, loginName, playRound, readUser, recordRound } from "./accounts.mjs";
import { isHouseRoom, stripBotPrize } from "./house.mjs";
import { act, enqueue, join, linePlace, runItBack, seatHandle, stepOut } from "./room.mjs";

const COOKIE = "row";
const YEAR = 60 * 60 * 24 * 365;

export function readCookie(header, name = COOKIE) {
  const raw = header || "";
  for (const part of raw.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return "";
}

export function sessionCookie(token, maxAge, secure) {
  const locked = secure ? "; Secure" : "";
  return `${COOKIE}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${locked}`;
}

export function isApi(pathname, method) {
  if (pathname === "/live.json") return method === "GET";
  if (pathname === "/me") return method === "GET";
  if (method !== "POST") return false;
  return pathname === "/keep" || pathname === "/login" || pathname === "/out" || pathname === "/round"
    || pathname === "/queue" || pathname === "/act" || pathname === "/again";
}

function reply(status, json, cookie = "") {
  return { status, json, cookie };
}

function text(status, value) {
  return { status, text: value, cookie: "" };
}

function clearYou(next) {
  next.you = null;
  return next;
}

function applyPost(path, body, handle, state) {
  const link = String(body.link || `https://${handle}.room`).slice(0, 64);
  const played = { ...body, handle, link };
  if (path === "/queue") {
    let next = state;
    if (!next.people.some((person) => person.handle === handle)) {
      const joined = join(next, { handle, link });
      if (!joined.ok) return joined;
      next = clearYou(joined.state);
    }
    const queued = enqueue(next, { handle, link, game: body.game, at: Date.now() });
    if (queued.ok) clearYou(queued.state);
    return queued;
  }
  if (path === "/again") {
    const result = played.stay === false ? stepOut(state, handle) : runItBack(state, handle);
    if (result.ok) clearYou(result.state);
    return result;
  }
  const result = act(state, played);
  if (result.ok) clearYou(result.state);
  return result;
}

function roomReply(result, state, handle) {
  return reply(result.ok ? 200 : 400, {
    ok: result.ok,
    error: result.error || null,
    place: linePlace(state, handle),
    call: state.call || null,
  });
}

export async function handleRow({ method, pathname, token, secure, bodyText, store, crowd, now = Date.now }) {
  if (!isApi(pathname, method)) return text(404, "Not found");
  const at = now();
  let body = {};
  if (method === "POST") {
    try {
      body = bodyText ? JSON.parse(bodyText) : {};
    } catch {
      return reply(400, { ok: false, error: "Bad request." });
    }
    if (!body || typeof body !== "object") return reply(400, { ok: false, error: "Bad request." });
  }

  if (pathname === "/me") {
    return store.transact(({ book }) => reply(200, { ok: true, user: readUser(book, token, at) }));
  }

  if (pathname === "/out") {
    return store.transact(({ book, saveBook }) => {
      saveBook(dropSession(book, token));
      return reply(200, { ok: true, user: null }, sessionCookie("", 0, secure));
    });
  }

  if (pathname === "/login" || pathname === "/keep") {
    return store.transact(({ book, saveBook }) => {
      const result = pathname === "/login" ? loginName(book, body, at) : keepName(book, { ...body, token }, at);
      if (!result.ok) return reply(400, { ok: false, error: result.error });
      saveBook(result.book);
      return reply(200, { ok: true, user: result.user }, sessionCookie(result.token, YEAR, secure));
    });
  }

  if (pathname === "/round") {
    return store.transact(({ book, saveBook }) => {
      const result = playRound(book, token, body, at);
      if (!result.ok) return reply(400, { ok: false, error: result.error });
      saveBook(result.book);
      return reply(200, { ok: true, user: result.user, wrote: Boolean(result.wrote) });
    });
  }

  if (pathname === "/live.json") {
    return store.transact(({ live }) => reply(200, { ...live.state, beating: crowd }));
  }

  return store.transact(({ book, live, saveBook, saveLive }) => {
    const gate = actingHandle(book, token, body.handle, at);
    if (!gate.ok) {
      return reply(400, { ok: false, error: gate.error, place: 0, call: live.state.call || null });
    }
    const before = live.state.pile?.status;
    const played = applyPost(pathname, body, gate.handle, live.state);
    if (!played.ok) return roomReply(played, live.state, gate.handle);
    const result = { ...played, state: isHouseRoom(played.state) ? stripBotPrize(played.state) : played.state };
    saveLive({ ...live, state: result.state });
    if (before !== "won" && result.state.pile?.status === "won" && result.state.pile.winner) {
      const winner = seatHandle(result.state, result.state.pile.winner);
      const loser = seatHandle(result.state, result.state.pile.winner === "left" ? "right" : "left");
      const recorded = recordRound(book, {
        winner,
        loser,
        held: result.state.drop?.holder === winner,
        dropId: result.state.drop?.id,
      }, at);
      if (recorded.ok && recorded.book) saveBook(recorded.book);
    }
    return roomReply(result, result.state, gate.handle);
  });
}
