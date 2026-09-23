import { NextResponse, type NextRequest } from "next/server";

import { insertSuggestion, rateAgent, readPass } from "@/lib/agent-store";
import {
  applyAgentCookies,
  snapshotFromRequestCookies,
} from "@/lib/agent-row-io";
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

function send(
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

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "suggest");
  const snapshot = snapshotFromRequestCookies(
    (name) => request.cookies.get(name)?.value,
  );
  const pass = await readPass(snapshot);
  const home = agentTalkPath();

  if (intent === "rate") {
    const aboutHandle = String(form.get("aboutHandle") ?? "").trim();
    const stars = Number(String(form.get("stars") ?? "").trim());
    if (pass?.handle && aboutHandle === pass.handle) {
      return send(request, `${home}?error=subject`);
    }
    const result = await rateAgent(
      {
        fromHandle: pass?.handle ?? "walker",
        about: "pass",
        aboutHandle,
        stars,
        body: String(form.get("body") ?? ""),
      },
      snapshot,
    );
    if (!result.ok) {
      return send(request, `${home}?error=${result.reason}`, result.cookies);
    }
    return send(request, home, result.cookies);
  }

  const result = await insertSuggestion(
    {
      fromHandle: pass?.handle ?? "walker",
      body: String(form.get("body") ?? ""),
    },
    snapshot,
  );
  if (!result.ok) {
    return send(request, `${home}?error=${result.reason}`, result.cookies);
  }
  return send(request, home, result.cookies);
}

export async function GET(request: NextRequest) {
  return send(request, agentsPath());
}
