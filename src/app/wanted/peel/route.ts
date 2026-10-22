import { NextResponse, type NextRequest } from "next/server";

import { wantedPath } from "@/lib/paths";
import {
  parseWantedHunts,
  peelHunt,
  serializeWantedHunts,
  WANTED_COOKIE_NAME,
} from "@/lib/wanted";
import { sameOriginUrl } from "@/lib/same-origin";


export async function POST(request: NextRequest) {
  const form = await request.formData();
  const huntId = String(form.get("huntId") ?? "");
  const existing = parseWantedHunts(
    request.cookies.get(WANTED_COOKIE_NAME)?.value,
  );
  const hunts = peelHunt(existing, huntId);

  const response = NextResponse.redirect(
    sameOriginUrl(request, wantedPath()),
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
  return NextResponse.redirect(sameOriginUrl(request, wantedPath()), 303);
}
