import { NextResponse, type NextRequest } from "next/server";

import {
  BOOTH_DIG_COOKIE_NAME,
  clearBoothDig,
  parseBoothDig,
  resolveBoothDigStall,
  serializeBoothDig,
  stallDigPath,
  tapeBoothDig,
} from "@/lib/booth-dig";

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
      name: BOOTH_DIG_COOKIE_NAME,
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
  const stall = resolveBoothDigStall(stallKey);
  const fallback = stall
    ? stallDigPath(stall.slug)
    : stallDigPath(stallKey.trim() || "missing");
  const returnTo = safeReturnTo(
    String(form.get("returnTo") ?? fallback),
    fallback,
  );
  const existing = parseBoothDig(
    request.cookies.get(BOOTH_DIG_COOKIE_NAME)?.value,
  );

  if (!stall) {
    return send(request, fallback);
  }

  if (intent === "clear") {
    const result = clearBoothDig(stall, existing);
    return send(request, returnTo, serializeBoothDig(result.map));
  }

  const result = tapeBoothDig(stall, existing, String(form.get("note") ?? ""));
  if (!result.ok) {
    if (result.reason === "empty") {
      const target = new URL(stallDigPath(stall.slug), originFrom(request));
      target.searchParams.set("error", "empty");
      return NextResponse.redirect(target, 303);
    }
    return send(request, stallDigPath(stall.slug));
  }

  return send(request, returnTo, serializeBoothDig(result.map));
}

export async function GET(request: NextRequest) {
  return NextResponse.redirect(
    new URL(stallDigPath("sunday-crate"), originFrom(request)),
    303,
  );
}
