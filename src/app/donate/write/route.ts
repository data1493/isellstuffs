import { NextResponse, type NextRequest } from "next/server";

import {
  AGENT_DONATION_CENTS,
  AGENT_TALK_COOKIE,
  parseAgentTalkCookie,
  writeDonation,
} from "@/lib/agent-talk";
import { donatePath } from "@/lib/paths";

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
  const raw = request.cookies.get(AGENT_TALK_COOKIE)?.value;
  const state = parseAgentTalkCookie(raw);
  const amountCents = Number(String(form.get("amountCents") ?? "").trim());

  if (!state.selfPassId) {
    return send(request, `${donatePath()}?error=pass`);
  }
  if (
    !Number.isInteger(amountCents) ||
    !AGENT_DONATION_CENTS.includes(
      amountCents as (typeof AGENT_DONATION_CENTS)[number],
    )
  ) {
    return send(request, `${donatePath()}?error=amount`);
  }

  const next = writeDonation(raw, {
    fromPassId: state.selfPassId,
    amountCents: String(amountCents),
  });
  return send(request, donatePath(), next);
}

export async function GET(request: NextRequest) {
  return send(request, donatePath());
}
