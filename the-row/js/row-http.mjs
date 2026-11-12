import { actingHandle, dropSession, keepName, loginName, playRound, readUser, recordRound } from "./accounts.mjs";
import { isHouseBot, isHouseRoom, stripBotPrize } from "./house.mjs";
import {
  LINE_MAX,
  VIBE_MAX,
  lineReady,
  rememberLine,
  rememberVibe,
  screenPublicText,
  vibeReady,
} from "./moderate.mjs";
import { act, enqueue, join, linePlace, renameHandle, runItBack, say, seatHandle, stepOut } from "./room.mjs";

const COOKIE = "row";
const YEAR = 60 * 60 * 24 * 365;

export function readCookie(header, name = COOKIE) {
  const raw = header || "";
  for (const part of raw.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key !== name) continue;
    try {
      return decodeURIComponent(rest.join("="));
    } catch {
      return "";
    }
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
    || pathname === "/queue" || pathname === "/act" || pathname === "/again" || pathname === "/vibe";
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

function applyPost(path, body, handle, state, at) {
  const link = String(body.link || `https://${handle}.room`).slice(0, 64);
  const played = { ...body, handle, link };
  if (path === "/queue") {
    let next = state;
    if (!next.people.some((person) => person.handle === handle)) {
      const joined = join(next, { handle, link });
      if (!joined.ok) return joined;
      next = clearYou(joined.state);
    }
    const queued = enqueue(next, { handle, link, game: body.game, at });
    if (queued.ok) clearYou(queued.state);
    return queued;
  }
  if (path === "/again") {
    const result = played.stay === false ? stepOut(state, handle) : runItBack(state, handle);
    if (result.ok) clearYou(result.state);
    return result;
  }
  const result = act(state, played, at);
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

function refuse(status, error, state, handle) {
  return reply(status, {
    ok: false,
    error,
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
    return store.transact(({ book, live, saveBook, saveLive }) => {
      const previous = readUser(book, token, at)?.handle || "";
      const result = pathname === "/login" ? loginName(book, body, at) : keepName(book, { ...body, token }, at);
      if (!result.ok) {
        if (result.wrote) saveBook(result.book);
        return reply(result.locked ? 429 : 400, { ok: false, error: result.error });
      }
      saveBook(result.book);
      const renamed = pathname === "/keep" && previous && result.user?.handle && previous !== result.user.handle;
      if (renamed && live?.state) saveLive({ ...live, state: renameHandle(live.state, previous, result.user.handle) });
      return reply(200, { ok: true, user: result.user }, sessionCookie(result.token, YEAR, secure));
    });
  }

  if (pathname === "/round") {
    if (body.kind === "line") {
      const screened = screenPublicText(body.text, LINE_MAX);
      if (!screened.ok) return reply(screened.status, { ok: false, error: screened.error });
      body = { ...body, text: screened.text };
    }
    return store.transact(({ book, saveBook }) => {
      const result = playRound(book, token, body, at);
      if (!result.ok) return reply(400, { ok: false, error: result.error });
      saveBook(result.book);
      return reply(200, { ok: true, user: result.user, wrote: Boolean(result.wrote) });
    });
  }

  if (pathname === "/vibe") {
    return store.transact(({ book, live, saveBook, saveLive }) => {
      const gate = actingHandle(book, token, body.handle, at);
      if (!gate.ok) return refuse(400, gate.error, live.state, body.handle || "");
      const screened = screenPublicText(body.text, VIBE_MAX);
      if (!screened.ok) return refuse(screened.status, screened.error, live.state, gate.handle);
      const pace = vibeReady(book, token, at);
      if (!pace.ok) return refuse(pace.status, pace.error, live.state, gate.handle);
      const said = say(live.state, { handle: gate.handle, text: screened.text });
      if (!said.ok) return roomReply(said, live.state, gate.handle);
      clearYou(said.state);
      saveLive({ ...live, state: said.state });
      saveBook(rememberVibe(book, token, at));
      return roomReply(said, said.state, gate.handle);
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
    let posted = body;
    if (pathname === "/act" && body.kind === "line") {
      const screened = screenPublicText(body.text, LINE_MAX);
      if (!screened.ok) return refuse(screened.status, screened.error, live.state, gate.handle);
      const pace = lineReady(book, token, live.state, at);
      if (!pace.ok) return refuse(pace.status, pace.error, live.state, gate.handle);
      posted = { ...body, text: screened.text };
    }
    const before = live.state.pile?.status;
    const played = applyPost(pathname, posted, gate.handle, live.state, at);
    if (!played.ok) return roomReply(played, live.state, gate.handle);
    const result = { ...played, state: isHouseRoom(played.state) ? stripBotPrize(played.state) : played.state };
    let nextBook = null;
    if (pathname === "/act" && posted.kind === "line") nextBook = rememberLine(book, token, live.state);
    saveLive({ ...live, state: result.state });
    if (before !== "won" && result.state.pile?.status === "won" && result.state.pile.winner) {
      const winner = seatHandle(result.state, result.state.pile.winner);
      if (isHouseBot(winner)) return roomReply(result, result.state, gate.handle);
      const loser = seatHandle(result.state, result.state.pile.winner === "left" ? "right" : "left");
      const recorded = recordRound(nextBook || book, {
        winner,
        loser,
        held: result.state.drop?.holder === winner,
        dropId: result.state.drop?.id,
      }, at);
      if (recorded.ok && recorded.book) nextBook = recorded.book;
    }
    if (nextBook) saveBook(nextBook);
    return roomReply(result, result.state, gate.handle);
  });
}
