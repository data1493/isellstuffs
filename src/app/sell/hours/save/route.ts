import { NextResponse, type NextRequest } from "next/server";

import { sellHoursPath } from "@/lib/paths";
import {
  WEEKEND_HOURS_COOKIE,
  hoursStallFromInput,
  parseWeekendHours,
  readWeekendHours,
  restoreWeekendHours,
  tapeWeekendHours,
  weekendHoursCookieValue,
  writeWeekendHours,
} from "@/lib/weekend-hours";

function safeReturnTo(value: string, fallback: string) {
  if (value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return fallback;
}

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
  const stallId = String(form.get("stallId") ?? "");
  const intent = String(form.get("intent") ?? "tape");
  const stall = hoursStallFromInput(stallId);
  const fallback = stall ? sellHoursPath(stall.slug) : sellHoursPath();
  const returnTo = safeReturnTo(
    String(form.get("returnTo") ?? fallback),
    fallback,
  );
  const current = {
    ...readWeekendHours(),
    ...parseWeekendHours(request.cookies.get(WEEKEND_HOURS_COOKIE)?.value),
  };

  const result =
    intent === "restore"
      ? restoreWeekendHours(stall, current)
      : tapeWeekendHours(stall, current, {
          hours: String(form.get("hours") ?? ""),
          place: String(form.get("place") ?? ""),
          note: String(form.get("note") ?? ""),
        });

  if (!result.ok && result.reason === "missing") {
    const path = stallId.trim()
      ? `${sellHoursPath()}?stall=${encodeURIComponent(stallId.trim())}`
      : sellHoursPath();
    return NextResponse.redirect(new URL(path, originFrom(request)), 303);
  }

  if (!result.ok && result.reason === "empty") {
    const path = stall
      ? `${sellHoursPath(stall.slug)}&error=empty`
      : `${sellHoursPath()}?error=empty`;
    return NextResponse.redirect(new URL(path, originFrom(request)), 303);
  }

  writeWeekendHours(result.map);
  const response = NextResponse.redirect(
    new URL(returnTo, originFrom(request)),
    303,
  );
  response.cookies.set({
    name: WEEKEND_HOURS_COOKIE,
    value: weekendHoursCookieValue(result.map),
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}

export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL(sellHoursPath(), originFrom(request)), 303);
}
