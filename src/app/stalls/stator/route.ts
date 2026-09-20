import { NextResponse, type NextRequest } from "next/server";

import {
  BOOTH_STATOR_COOKIE_NAME,
  clearBoothStator,
  parseBoothStator,
  resolveBoothStatorStall,
  serializeBoothStator,
  stallStatorPath,
  tapeBoothStator,
} from "@/lib/booth-stator";

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
      name: BOOTH_STATOR_COOKIE_NAME,
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
  const stall = resolveBoothStatorStall(stallKey);
  const fallback = stall
    ? stallStatorPath(stall.slug)
    : stallStatorPath(stallKey.trim() || "missing");
  const returnTo = safeReturnTo(
    String(form.get("returnTo") ?? fallback),
    fallback,
  );
  const existing = parseBoothStator(
    request.cookies.get(BOOTH_STATOR_COOKIE_NAME)?.value,
  );

  if (!stall) {
    return send(request, fallback);
  }

  if (intent === "clear") {
    const cleared = clearBoothStator(stall, existing);
    return send(request, returnTo, serializeBoothStator(cleared.map));
  }

  const taped = tapeBoothStator(
    stall,
    existing,
    String(form.get("note") ?? ""),
  );
  if (!taped.ok) {
    if (taped.reason === "empty") {
      const target = new URL(stallStatorPath(stall.slug), originFrom(request));
      target.searchParams.set("error", "empty");
      return NextResponse.redirect(target, 303);
    }
    return send(request, stallStatorPath(stall.slug));
  }

  return send(request, returnTo, serializeBoothStator(taped.map));
}

export async function GET(request: NextRequest) {
  return NextResponse.redirect(
    new URL(stallStatorPath("sunday-crate"), originFrom(request)),
    303,
  );
}
