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
import { sameOriginUrl } from "@/lib/same-origin";

function safeReturnTo(value: string, fallback: string) {
  if (value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return fallback;
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
    return NextResponse.redirect(sameOriginUrl(request, path), 303);
  }

  if (!result.ok && result.reason === "empty") {
    const path = stall
      ? `${sellRainPath(stall.slug)}&error=empty`
      : `${sellRainPath()}?error=empty`;
    return NextResponse.redirect(sameOriginUrl(request, path), 303);
  }

  writeRainDates(result.map);
  const response = NextResponse.redirect(
    sameOriginUrl(request, returnTo),
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
  return NextResponse.redirect(sameOriginUrl(request, sellRainPath()), 303);
}
