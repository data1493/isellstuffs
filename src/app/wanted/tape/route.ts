import { NextResponse, type NextRequest } from "next/server";

import { wantedPath } from "@/lib/paths";
import {
  parseWantedHunts,
  serializeWantedHunts,
  tapeHunt,
  WANTED_COOKIE_NAME,
} from "@/lib/wanted";
import { sameOriginUrl } from "@/lib/same-origin";


function send(request: NextRequest, path: string, cookieValue?: string) {
  const response = NextResponse.redirect(sameOriginUrl(request, path), 303);
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
