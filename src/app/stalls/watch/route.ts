import { NextResponse, type NextRequest } from "next/server";

import { watchedPath } from "@/lib/paths";
import {
  addStallIdToWatched,
  parseWatchedStallIds,
  removeStallIdFromWatched,
  WATCHED_COOKIE_NAME,
} from "@/lib/watched-stalls";

function safeReturnTo(value: string) {
  if (value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return watchedPath();
}

function withPackedNotice(path: string) {
  const url = new URL(path, "http://iss.local");
  if (url.pathname === watchedPath() || url.pathname.startsWith(`${watchedPath()}/`)) {
    url.searchParams.set("notice", "packed");
    return `${url.pathname}${url.search}`;
  }
  return path;
}

function writeWatchedCookie(response: NextResponse, stallIds: string[]) {
  response.cookies.set({
    name: WATCHED_COOKIE_NAME,
    value: JSON.stringify(stallIds),
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const stallId = String(form.get("stallId") ?? "");
  const returnTo = safeReturnTo(String(form.get("returnTo") ?? watchedPath()));
  const intent = String(form.get("intent") ?? "watch");
  const current = parseWatchedStallIds(
    request.cookies.get(WATCHED_COOKIE_NAME)?.value,
  );

  const referer = request.headers.get("referer");
  const origin =
    request.headers.get("origin") ??
    (referer ? new URL(referer).origin : request.nextUrl.origin);

  if (intent === "drop") {
    const result = removeStallIdFromWatched(stallId, current);
    const response = NextResponse.redirect(new URL(returnTo, origin), 303);
    writeWatchedCookie(response, result.stallIds);
    return response;
  }

  const result = addStallIdToWatched(stallId, current);
  if (!result.ok) {
    const response = NextResponse.redirect(
      new URL(withPackedNotice(returnTo), origin),
      303,
    );
    return response;
  }

  const response = NextResponse.redirect(new URL(returnTo, origin), 303);
  writeWatchedCookie(response, result.stallIds);
  return response;
}
