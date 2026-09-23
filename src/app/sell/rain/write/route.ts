import { NextResponse, type NextRequest } from "next/server";

import { sellRainPath } from "@/lib/paths";
import {
  RAIN_DATE_COOKIE,
  parseRainDates,
  rainDateCookieValue,
  rainStallFromInput,
  readRainDates,
  restoreRainDate,
  tapeRainDate,
  writeRainDates,
} from "@/lib/rain-date";

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
  const stall = rainStallFromInput(stallId);
  const fallback = stall ? sellRainPath(stall.slug) : sellRainPath();
  const returnTo = safeReturnTo(
    String(form.get("returnTo") ?? fallback),
    fallback,
  );
  const current = {
    ...readRainDates(),
    ...parseRainDates(request.cookies.get(RAIN_DATE_COOKIE)?.value),
  };

  const result =
    intent === "restore"
      ? restoreRainDate(stall, current)
      : tapeRainDate(stall, current, {
          hours: String(form.get("hours") ?? ""),
          place: String(form.get("place") ?? ""),
          note: String(form.get("note") ?? ""),
        });

  if (!result.ok && result.reason === "missing") {
    const path = stallId.trim()
      ? `${sellRainPath()}?stall=${encodeURIComponent(stallId.trim())}`
      : sellRainPath();
    return NextResponse.redirect(new URL(path, originFrom(request)), 303);
  }

  if (!result.ok && result.reason === "empty") {
    const path = stall
      ? `${sellRainPath(stall.slug)}&error=empty`
      : `${sellRainPath()}?error=empty`;
    return NextResponse.redirect(new URL(path, originFrom(request)), 303);
  }

  writeRainDates(result.map);
  const response = NextResponse.redirect(
    new URL(returnTo, originFrom(request)),
    303,
  );
  response.cookies.set({
    name: RAIN_DATE_COOKIE,
    value: rainDateCookieValue(result.map),
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}

export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL(sellRainPath(), originFrom(request)), 303);
}
