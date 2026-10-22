import { NextResponse, type NextRequest } from "next/server";

import {
  GIFT_CREDITS_COOKIE,
  parseGiftCredits,
  redeemGiftCode,
  serializeGiftCredits,
} from "@/lib/gift-desk";
import { giftPath } from "@/lib/paths";
import { sameOriginUrl } from "@/lib/same-origin";


function send(request: NextRequest, path: string, cookieValue?: string) {
  const response = NextResponse.redirect(sameOriginUrl(request, path), 303);
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
