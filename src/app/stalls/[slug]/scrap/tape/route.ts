import { NextResponse, type NextRequest } from "next/server";

import { stallScrapPath } from "@/lib/paths";
import {
  parseStallScraps,
  serializeStallScraps,
  tapeStallScrap,
  STALL_SCRAP_COOKIE_NAME,
} from "@/lib/stall-scrap";

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
      name: STALL_SCRAP_COOKIE_NAME,
      value: cookieValue,
      path: "/",
      sameSite: "lax",
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return response;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const form = await request.formData();
  const note = String(form.get("note") ?? "");
  const existing = parseStallScraps(
    request.cookies.get(STALL_SCRAP_COOKIE_NAME)?.value,
  );
  const result = tapeStallScrap(existing, slug, note);
  const scrap = stallScrapPath(slug);

  if (!result.ok) {
    if (result.reason === "empty") {
      return send(request, `${scrap}?error=empty`);
    }
    return send(request, scrap);
  }

  return send(request, scrap, serializeStallScraps(result.scraps));
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  return send(request, stallScrapPath(slug));
}
