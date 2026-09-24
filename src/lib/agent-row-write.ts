/**
 * Shared Agent Row POST helpers. /agents/write and /agents/trade
 * call the same store writes, then 303.
 */
import { NextResponse, type NextRequest } from "next/server";

import {
  confirmTrade,
  insertLot,
  insertTrade,
  rateAgent,
  readPass,
  voidTrade,
  writePass,
  type AgentAsset,
  type AgentStoreReason,
} from "@/lib/agent-store";
import {
  applyAgentCookies,
  parseAskCents,
  snapshotFromRequestCookies,
} from "@/lib/agent-row-io";
import {
  agentTalkPath,
  agentsPath,
  chatPath,
  donatePath,
  tradePath,
  tradeSlipPath,
} from "@/lib/paths";

const ASSETS = new Set(["usdc", "eth"]);

export const TRADE_INTENTS = new Set(["take", "confirm", "void"]);

function originFrom(request: NextRequest) {
  const fromOrigin = request.headers.get("origin");
  if (fromOrigin) return fromOrigin;
  const referer = request.headers.get("referer");
  if (referer) return new URL(referer).origin;
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? "http";
  if (host) return `${proto}://${host}`;
  return request.nextUrl.origin;
}

function pathOnly(path: string) {
  return path.split("?")[0] ?? path;
}

export function safeReturn(raw: string, fallback: string) {
  const path = raw.trim();
  const bare = pathOnly(path);
  if (
    bare === "/" ||
    bare === chatPath() ||
    bare === tradePath() ||
    bare === agentsPath() ||
    bare === agentTalkPath() ||
    bare === donatePath()
  ) {
    return path;
  }
  if (bare.startsWith(`${tradePath()}/`)) {
    const id = bare.slice(tradePath().length + 1);
    if (id && !id.includes("/")) {
      return path;
    }
  }
  if (bare.startsWith(`${agentsPath()}/`)) {
    const rest = bare.slice(agentsPath().length + 1);
    if (rest && !rest.includes("/") && !["write", "talk", "trade"].includes(rest)) {
      return path;
    }
  }
  return fallback;
}

export function send(
  request: NextRequest,
  path: string,
  cookies?: Parameters<typeof applyAgentCookies>[1],
) {
  const response = NextResponse.redirect(new URL(path, originFrom(request)), 303);
  if (cookies) {
    applyAgentCookies(response, cookies);
  }
  return response;
}

export function fail(
  request: NextRequest,
  home: string,
  reason: AgentStoreReason | "pass" | "subject",
  cookies?: Parameters<typeof applyAgentCookies>[1],
) {
  const join = home.includes("?") ? "&" : "?";
  return send(request, `${home}${join}error=${reason}`, cookies);
}

export async function handleAgentTradePost(
  request: NextRequest,
  form: FormData,
) {
  const snapshot = snapshotFromRequestCookies(
    (name) => request.cookies.get(name)?.value,
  );
  const pass = await readPass(snapshot);
  const intent = String(form.get("intent") ?? "");

  const home = safeReturn(String(form.get("returnTo") ?? ""), tradePath());

  if (intent === "take") {
    if (!pass) {
      return fail(request, home, "pass");
    }
    const result = await insertTrade(
      {
        lotId: String(form.get("lotId") ?? ""),
        takerHandle: pass.handle,
      },
      snapshot,
    );
    if (!result.ok) {
      return fail(request, home, result.reason, result.cookies);
    }
    return send(request, tradeSlipPath(result.value.id), result.cookies);
  }

  if (intent === "confirm" || intent === "void") {
    const tradeId = String(form.get("tradeId") ?? "");
    const result =
      intent === "confirm"
        ? await confirmTrade(tradeId, snapshot)
        : await voidTrade(tradeId, snapshot);
    if (!result.ok) {
      return fail(request, home, result.reason, result.cookies);
    }
    return send(request, tradeSlipPath(tradeId), result.cookies);
  }

  return send(request, home);
}

export async function handleAgentWritePost(
  request: NextRequest,
  form: FormData,
) {
  const intent = String(form.get("intent") ?? "");
  if (TRADE_INTENTS.has(intent)) {
    return handleAgentTradePost(request, form);
  }

  const snapshot = snapshotFromRequestCookies(
    (name) => request.cookies.get(name)?.value,
  );
  const pass = await readPass(snapshot);
  const home = safeReturn(String(form.get("returnTo") ?? ""), tradePath());

  if (intent === "wear") {
    const result = await writePass(
      {
        handle: String(form.get("handle") ?? ""),
        publicAddress: String(form.get("publicAddress") ?? ""),
      },
      snapshot,
    );
    if (!result.ok) {
      return fail(request, home, result.reason, result.cookies);
    }
    return send(request, home, result.cookies);
  }

  if (intent === "aisle" || intent === "rate") {
    const about = intent === "aisle" ? "aisle" : "pass";
    const aboutHandle = String(form.get("aboutHandle") ?? "").trim();
    const stars = Number(String(form.get("stars") ?? "").trim());
    if (about === "pass" && pass?.handle && aboutHandle === pass.handle) {
      return fail(request, home, "subject");
    }
    const result = await rateAgent(
      {
        fromHandle: pass?.handle ?? "walker",
        about,
        aboutHandle: about === "pass" ? aboutHandle : null,
        stars,
        body: String(form.get("body") ?? ""),
      },
      snapshot,
    );
    if (!result.ok) {
      return fail(request, home, result.reason, result.cookies);
    }
    return send(request, home, result.cookies);
  }

  if (intent === "lot") {
    if (!pass) {
      return fail(request, home, "pass");
    }
    const askCents = parseAskCents(String(form.get("ask") ?? ""));
    const asset = String(form.get("asset") ?? "") as AgentAsset;
    if (askCents === null || !ASSETS.has(asset)) {
      return fail(request, home, "ask");
    }
    const result = await insertLot(
      {
        sellerHandle: pass.handle,
        title: String(form.get("title") ?? ""),
        askCents,
        asset,
      },
      snapshot,
    );
    if (!result.ok) {
      return fail(request, home, result.reason, result.cookies);
    }
    return send(request, home, result.cookies);
  }

  return send(request, home);
}
