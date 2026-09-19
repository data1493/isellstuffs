import { NextResponse, type NextRequest } from "next/server";

import {
  BOOTH_POLY_COOKIE_NAME,
  clearBoothPoly,
  parseBoothPoly,
  resolveBoothPolyStall,
  serializeBoothPoly,
  tapeBoothPoly,
} from "@/lib/booth-poly";
import { stallPolyPath } from "@/lib/paths";

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

function safeReturnTo(value: string, fallback: string) {
  if (value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return fallback;
}

function send(request: NextRequest, path: string, cookieValue?: string) {
  const response = NextResponse.redirect(new URL(path, originFrom(request)), 303);
  if (cookieValue !== undefined) {
    response.cookies.set({
      name: BOOTH_POLY_COOKIE_NAME,
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
  const stallKey = String(form.get("stallId") ?? "");
  const intent = String(form.get("intent") ?? "tape");
  const stall = resolveBoothPolyStall(stallKey);
  const fallback = stall
    ? stallPolyPath(stall.slug)
    : stallPolyPath(stallKey.trim() || "missing");
  const returnTo = safeReturnTo(
    String(form.get("returnTo") ?? fallback),
    fallback,
  );
  const existing = parseBoothPoly(
    request.cookies.get(BOOTH_POLY_COOKIE_NAME)?.value,
  );

  if (!stall) {
    return send(request, fallback);
  }

  if (intent === "clear") {
    const result = clearBoothPoly(stall, existing);
    return send(request, returnTo, serializeBoothPoly(result.map));
  }

  const result = tapeBoothPoly(stall, existing, String(form.get("note") ?? ""));
  if (!result.ok) {
    if (result.reason === "empty") {
      const target = new URL(stallPolyPath(stall.slug), originFrom(request));
      target.searchParams.set("error", "empty");
      return NextResponse.redirect(target, 303);
    }
    return send(request, stallPolyPath(stall.slug));
  }

  return send(request, returnTo, serializeBoothPoly(result.map));
}

export async function GET(request: NextRequest) {
  return NextResponse.redirect(
    new URL(stallPolyPath("sunday-crate"), originFrom(request)),
    303,
  );
}
