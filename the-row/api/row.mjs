import { Redis } from "@upstash/redis";
import { handleRow, readCookie } from "../js/row-http.mjs";
import { createRedisStore, redisOptionsFromEnv } from "../js/redis-store.mjs";

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

function getStore() {
  if (store) return store;
  const options = redisOptionsFromEnv();
  if (!options) throw new Error("Upstash Redis is not configured.");
  store = createRedisStore({
    redis: new Redis(options),
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
