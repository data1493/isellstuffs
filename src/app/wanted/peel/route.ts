import { NextResponse, type NextRequest } from "next/server";

import { wantedPath } from "@/lib/paths";
import {
  parseWantedHunts,
  peelHunt,
  serializeWantedHunts,
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

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const huntId = String(form.get("huntId") ?? "");
  const existing = parseWantedHunts(
    request.cookies.get(WANTED_COOKIE_NAME)?.value,
  );
  const hunts = peelHunt(existing, huntId);

  const response = NextResponse.redirect(
    new URL(wantedPath(), originFrom(request)),
    303,
  );
  response.cookies.set({
    name: WANTED_COOKIE_NAME,
    value: serializeWantedHunts(hunts),
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}

export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL(wantedPath(), originFrom(request)), 303);
}
