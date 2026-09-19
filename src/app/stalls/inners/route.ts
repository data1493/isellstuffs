import { NextResponse, type NextRequest } from "next/server";

import {
  BOOTH_INNERS_COOKIE_NAME,
  clearBoothInners,
  parseBoothInners,
  resolveBoothInnersStall,
  serializeBoothInners,
  stallInnersPath,
  tapeBoothInners,
} from "@/lib/booth-inners";

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
      name: BOOTH_INNERS_COOKIE_NAME,
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
  const stall = resolveBoothInnersStall(stallKey);
  const fallback = stall
    ? stallInnersPath(stall.slug)
    : stallInnersPath(stallKey.trim() || "missing");
  const returnTo = safeReturnTo(
    String(form.get("returnTo") ?? fallback),
    fallback,
  );
  const existing = parseBoothInners(
    request.cookies.get(BOOTH_INNERS_COOKIE_NAME)?.value,
  );

  if (!stall) {
    return send(request, fallback);
  }

  if (intent === "clear") {
    const cleared = clearBoothInners(stall, existing);
    return send(request, returnTo, serializeBoothInners(cleared.map));
  }

  const taped = tapeBoothInners(stall, existing, String(form.get("note") ?? ""));
  if (!taped.ok) {
    if (taped.reason === "empty") {
      const target = new URL(stallInnersPath(stall.slug), originFrom(request));
      target.searchParams.set("error", "empty");
      return NextResponse.redirect(target, 303);
    }
    return send(request, stallInnersPath(stall.slug));
  }

  return send(request, returnTo, serializeBoothInners(taped.map));
}

export async function GET(request: NextRequest) {
  return NextResponse.redirect(
    new URL(stallInnersPath("sunday-crate"), originFrom(request)),
    303,
  );
}
