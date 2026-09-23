import { NextResponse, type NextRequest } from "next/server";

import { wantedPath } from "@/lib/paths";
import {
  parseWantedHunts,
  serializeWantedHunts,
  tapeHunt,
  WANTED_COOKIE_NAME,
} from "@/lib/wanted";

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
      name: WANTED_COOKIE_NAME,
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
  const note = String(form.get("note") ?? "");
  const existing = parseWantedHunts(
    request.cookies.get(WANTED_COOKIE_NAME)?.value,
  );
  const result = tapeHunt(existing, note);

  if (!result.ok) {
    return send(request, `${wantedPath()}?error=empty`);
  }

  return send(request, wantedPath(), serializeWantedHunts(result.hunts));
}

export async function GET(request: NextRequest) {
  return send(request, wantedPath());
}
