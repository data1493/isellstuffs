import { NextResponse, type NextRequest } from "next/server";

import {
  AGENT_TALK_COOKIE,
  agentPassById,
  normalizeAgentBody,
  parseAgentStars,
  parseAgentTalkCookie,
  writeAgentRate,
  writeTalkLine,
} from "@/lib/agent-talk";
import { agentTalkPath, agentsPath } from "@/lib/paths";

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
  const intent = String(form.get("intent") ?? "talk");
  const raw = request.cookies.get(AGENT_TALK_COOKIE)?.value;
  const state = parseAgentTalkCookie(raw);
  const home = agentTalkPath();

  if (intent === "rate") {
    const fromPassId = state.selfPassId;
    const subject = String(form.get("subject") ?? "");
    const stars = parseAgentStars(String(form.get("stars") ?? ""));
    if (!fromPassId) {
      return send(request, `${home}?error=pass`);
    }
    if (!stars) {
      return send(request, `${home}?error=stars`);
    }
    if (!agentPassById(subject) || subject === fromPassId) {
      return send(request, `${home}?error=subject`);
    }
    const next = writeAgentRate(raw, {
      fromPassId,
      subject,
      stars: String(stars),
      body: String(form.get("body") ?? ""),
    });
    return send(request, home, next);
  }

  const fromPassId = state.selfPassId;
  const toPassId = String(form.get("toPassId") ?? "");
  const body = normalizeAgentBody(String(form.get("body") ?? ""));
  if (!fromPassId) {
    return send(request, `${home}?error=pass`);
  }
  if (!agentPassById(toPassId) || toPassId === fromPassId) {
    return send(request, `${home}?error=subject`);
  }
  if (!body) {
    return send(request, `${home}?error=empty`);
  }
  const next = writeTalkLine(raw, { fromPassId, toPassId, body });
  return send(request, home, next);
}

export async function GET(request: NextRequest) {
  return send(request, agentsPath());
}
