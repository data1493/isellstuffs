import { get, put } from "@vercel/blob";
import { handleRow, readCookie } from "../js/row-http.mjs";
import { conflictError, createBlobStore, lostCreate } from "../js/blob-store.mjs";

const PATH = "row/state.json";
const PATHS = {
  me: "/me",
  keep: "/keep",
  login: "/login",
  out: "/out",
  round: "/round",
  queue: "/queue",
  act: "/act",
  again: "/again",
  live: "/live.json",
};

let store;

function blobReady() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

async function textFrom(stream) {
  const chunks = [];
  if (stream && typeof stream.getReader === "function") {
    const reader = stream.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(Buffer.from(value));
    }
  } else {
    for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
}

export async function readRowState() {
  const result = await get(PATH, { access: "private", useCache: false });
  if (!result || result.statusCode !== 200 || !result.stream) return null;
  let value;
  try {
    value = JSON.parse(await textFrom(result.stream));
  } catch {
    throw new Error("The room store could not be read.");
  }
  if (!value || typeof value !== "object") throw new Error("The room store could not be read.");
  return { value, etag: result.blob.etag };
}

export async function writeRowState(value, etag) {
  try {
    await put(PATH, JSON.stringify(value), {
      access: "private",
      contentType: "application/json",
      addRandomSuffix: false,
      cacheControlMaxAge: 60,
      ...(etag ? { ifMatch: etag } : {}),
    });
  } catch (error) {
    let current = null;
    if (!etag) {
      try {
        current = await readRowState();
      } catch {
        current = null;
      }
    }
    const decision = lostCreate(error, etag, value, current);
    if (decision === "retry") throw conflictError();
    if (decision === "ok") return;
    throw error;
  }
}

function getStore() {
  if (store) return store;
  if (!blobReady()) throw new Error("Vercel Blob is not configured.");
  store = createBlobStore({
    read: readRowState,
    write: writeRowState,
    crowd: process.env.ROW_CROWD === "1",
  });
  return store;
}

function routeOf(request) {
  const url = new URL(request.url);
  if (url.pathname === "/api/row") return PATHS[url.searchParams.get("row") || ""] || "";
  if (url.pathname === "/live.json") return "/live.json";
  const bare = url.pathname.replace(/^\//, "");
  if (PATHS[bare]) return PATHS[bare];
  const segment = url.pathname.split("/").filter(Boolean).pop() || "";
  return PATHS[segment] || url.pathname;
}

function text(status, value) {
  return new Response(value, {
    status,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function send(result) {
  if (result.text != null) return text(result.status, result.text);
  const headers = {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  };
  if (result.cookie) headers["set-cookie"] = result.cookie;
  return new Response(JSON.stringify(result.json), { status: result.status, headers });
}

async function handler(request) {
  try {
    const bodyText = request.method === "POST" ? await request.text() : "";
    const lazy = {
      transact(fn) {
        return getStore().transact(fn);
      },
    };
    const result = await handleRow({
      method: request.method,
      pathname: routeOf(request),
      token: readCookie(request.headers.get("cookie") || ""),
      secure: process.env.ROW_SECURE === "1" || request.headers.get("x-forwarded-proto") === "https",
      bodyText,
      store: lazy,
      crowd: process.env.ROW_CROWD === "1",
    });
    return send(result);
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Down");
    return text(500, "Down");
  }
}

export function GET(request) {
  return handler(request);
}

export function POST(request) {
  return handler(request);
}
