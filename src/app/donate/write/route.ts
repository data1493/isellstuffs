import { NextResponse, type NextRequest } from "next/server";

import {
  insertPledge,
  type DonateFrom,
  type DonateMethod,
} from "@/lib/agent-store";
import {
  applyAgentCookies,
  snapshotFromRequestCookies,
} from "@/lib/agent-row-io";
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
  const snapshot = snapshotFromRequestCookies(
    (name) => request.cookies.get(name)?.value,
  );
  const amountCents = Number(String(form.get("amountCents") ?? "").trim());
  const result = await insertPledge(
    {
      method: String(form.get("method") ?? "") as DonateMethod,
      amountCents,
      from: String(form.get("from") ?? "") as DonateFrom,
    },
    snapshot,
  );
  if (!result.ok) {
    return send(request, `${donatePath()}?error=${result.reason}`, result.cookies);
  }
  return send(request, donatePath(), result.cookies);
}

export async function GET(request: NextRequest) {
  return send(request, donatePath());
}
