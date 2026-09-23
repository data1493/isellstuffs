import { NextResponse, type NextRequest } from "next/server";

import { stallFreePath } from "@/lib/paths";
import {
  FREE_BOX_COOKIE_NAME,
  parseFreeBox,
  peelFreeTitle,
  resolveFreeStall,
  serializeFreeBox,
  tapeFreeTitle,
} from "@/lib/free-box";

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

function send(request: NextRequest, path: string, cookieValue?: string) {
  const response = NextResponse.redirect(new URL(path, originFrom(request)), 303);
  if (cookieValue !== undefined) {
    response.cookies.set({
      name: FREE_BOX_COOKIE_NAME,
      value: cookieValue,
      path: "/",
      sameSite: "lax",
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return response;
}

function stallKeyFrom(form: FormData) {
  return String(form.get("slug") ?? form.get("stallId") ?? "").trim();
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const stallKey = stallKeyFrom(form);
  const intent = String(form.get("intent") ?? "tape").trim().toLowerCase();
  const stall = resolveFreeStall(stallKey);
  const fallback = stall
    ? stallFreePath(stall.slug)
    : stallFreePath(stallKey || "missing");
  const existing = parseFreeBox(
    request.cookies.get(FREE_BOX_COOKIE_NAME)?.value,
  );

  if (intent === "peel") {
    const titleId = String(form.get("titleId") ?? "");
    const titles = peelFreeTitle(existing, titleId);
    return send(request, fallback, serializeFreeBox(titles));
  }

  const raw = String(form.get("title") ?? form.get("note") ?? "");
  const result = tapeFreeTitle(existing, stallKey, raw);

  if (!result.ok) {
    if (result.reason === "empty") {
      return send(request, `${fallback}?error=empty`);
    }
    return send(request, fallback);
  }

  return send(request, fallback, serializeFreeBox(result.titles));
}

export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL("/explore", originFrom(request)), 303);
}
