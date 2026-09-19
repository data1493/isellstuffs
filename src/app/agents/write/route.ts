import { NextResponse, type NextRequest } from "next/server";

import {
  AGENT_TALK_COOKIE,
  agentPassById,
  isTradeableListing,
  parseAgentStars,
  parseAgentTalkCookie,
  writeAgentRate,
  writeConfirmTrade,
  writeOpenTrade,
  writeWearPass,
} from "@/lib/agent-talk";
import { listingById } from "@/lib/commerce";
import { agentTalkPath, agentsPath, donatePath } from "@/lib/paths";

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

function safeReturn(raw: string, fallback: string) {
  const path = raw.trim();
  if (
    path === agentsPath() ||
    path === agentTalkPath() ||
    path === donatePath()
  ) {
    return path;
  }
  if (path.startsWith(`${agentsPath()}?`) || path.startsWith(`${agentTalkPath()}?`)) {
    return path;
  }
  return fallback;
}

function send(request: NextRequest, path: string, cookieValue?: string) {
  const response = NextResponse.redirect(new URL(path, originFrom(request)), 303);
  if (cookieValue) {
    response.cookies.set({
      name: AGENT_TALK_COOKIE,
      value: cookieValue,
      path: "/",
      sameSite: "lax",
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return response;
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");
  const raw = request.cookies.get(AGENT_TALK_COOKIE)?.value;
  const state = parseAgentTalkCookie(raw);
  const home = safeReturn(String(form.get("returnTo") ?? ""), agentsPath());

  if (intent === "wear") {
    const passId = String(form.get("passId") ?? "");
    if (!agentPassById(passId)) {
      return send(request, `${home}${home.includes("?") ? "&" : "?"}error=pass`);
    }
    return send(request, home, writeWearPass(raw, passId));
  }

  if (intent === "aisle" || intent === "rate") {
    const fromPassId = state.selfPassId;
    const subject =
      intent === "aisle" ? "aisle" : String(form.get("subject") ?? "");
    const stars = parseAgentStars(String(form.get("stars") ?? ""));
    if (!fromPassId) {
      return send(request, `${home}${home.includes("?") ? "&" : "?"}error=pass`);
    }
    if (!stars) {
      return send(request, `${home}${home.includes("?") ? "&" : "?"}error=stars`);
    }
    if (subject !== "aisle") {
      if (!agentPassById(subject) || subject === fromPassId) {
        return send(
          request,
          `${home}${home.includes("?") ? "&" : "?"}error=subject`,
        );
      }
    }
    const next = writeAgentRate(raw, {
      fromPassId,
      subject,
      stars: String(stars),
      body: String(form.get("body") ?? ""),
    });
    return send(request, home, next);
  }

  if (intent === "trade") {
    const fromPassId = state.selfPassId;
    const toPassId = String(form.get("toPassId") ?? "");
    const listingId = String(form.get("listingId") ?? "");
    if (!fromPassId) {
      return send(request, `${agentsPath()}?error=pass`);
    }
    if (!agentPassById(toPassId) || toPassId === fromPassId) {
      return send(request, `${agentsPath()}?error=subject`);
    }
    if (!isTradeableListing(listingById(listingId))) {
      return send(request, `${agentsPath()}?error=listing`);
    }
    const next = writeOpenTrade(raw, { fromPassId, toPassId, listingId });
    const parsed = parseAgentTalkCookie(next);
    const slip = parsed.trades[0]?.id;
    const dest = slip ? `${agentsPath()}?slip=${encodeURIComponent(slip)}` : agentsPath();
    return send(request, dest, next);
  }

  if (intent === "confirm") {
    const tradeId = String(form.get("tradeId") ?? "");
    const existing = state.trades.find((trade) => trade.id === tradeId);
    if (!existing) {
      return send(request, `${agentsPath()}?error=missing`);
    }
    const next = writeConfirmTrade(raw, tradeId);
    return send(
      request,
      `${agentsPath()}?slip=${encodeURIComponent(tradeId)}`,
      next,
    );
  }

  return send(request, agentsPath());
}

export async function GET(request: NextRequest) {
  return send(request, agentsPath());
}
