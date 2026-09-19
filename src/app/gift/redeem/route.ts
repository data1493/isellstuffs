import { NextResponse, type NextRequest } from "next/server";

import {
  GIFT_CREDITS_COOKIE,
  parseGiftCredits,
  redeemGiftCode,
  serializeGiftCredits,
} from "@/lib/gift-desk";
import { giftPath } from "@/lib/paths";

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
  if (cookieValue) {
    response.cookies.set({
      name: GIFT_CREDITS_COOKIE,
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
  const code = String(form.get("code") ?? "");
  const existing = parseGiftCredits(
    request.cookies.get(GIFT_CREDITS_COOKIE)?.value,
  );
  const result = redeemGiftCode(existing, code);

  if (!result.ok) {
    return send(request, `${giftPath()}?error=unknown`);
  }

  return send(
    request,
    giftPath(),
    serializeGiftCredits(result.credits),
  );
}

export async function GET(request: NextRequest) {
  return send(request, giftPath());
}
