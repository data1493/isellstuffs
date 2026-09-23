import { NextResponse, type NextRequest } from "next/server";

import {
  TABLE_SHARE_COOKIE_NAME,
  clearTableShare,
  parseTableShare,
  resolveShareStall,
  serializeTableShare,
  tapeTableShare,
} from "@/lib/table-share";
import { stallSharePath } from "@/lib/paths";

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
      name: TABLE_SHARE_COOKIE_NAME,
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
  const stall = resolveShareStall(stallKey);
  const fallback = stall
    ? stallSharePath(stall.slug)
    : stallSharePath(stallKey.trim() || "missing");
  const returnTo = safeReturnTo(
    String(form.get("returnTo") ?? fallback),
    fallback,
  );
  const existing = parseTableShare(
    request.cookies.get(TABLE_SHARE_COOKIE_NAME)?.value,
  );

  if (!stall) {
    return send(request, fallback);
  }

  if (intent === "clear") {
    const result = clearTableShare(stall, existing);
    return send(request, returnTo, serializeTableShare(result.map));
  }

  const result = tapeTableShare(
    stall,
    existing,
    String(form.get("sharerId") ?? ""),
  );
  if (!result.ok) {
    const target = new URL(stallSharePath(stall.slug), originFrom(request));
    if (result.reason === "empty") {
      target.searchParams.set("error", "empty");
      return NextResponse.redirect(target, 303);
    }
    if (result.reason === "self") {
      target.searchParams.set("error", "self");
      return NextResponse.redirect(target, 303);
    }
    return send(request, stallSharePath(stall.slug));
  }

  return send(request, returnTo, serializeTableShare(result.map));
}

export async function GET(request: NextRequest) {
  return NextResponse.redirect(
    new URL(stallSharePath("folding-table-tuesday"), originFrom(request)),
    303,
  );
}
