import { NextResponse, type NextRequest } from "next/server";

import {
  CART_COOKIE_NAME,
  cartCookieValue,
  parseCartListingIds,
} from "@/lib/cart";
import { shakeCartListingIds } from "@/lib/cart-shake";
import { cartShakePath } from "@/lib/paths";

function originFrom(request: NextRequest) {
  const fromOrigin = request.headers.get("origin");
  if (fromOrigin) return fromOrigin;
  const referer = request.headers.get("referer");
  if (referer) return new URL(referer).origin;
  return request.nextUrl.origin;
}

function safeReturnTo(value: string) {
  if (value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return cartShakePath();
}

export async function POST(request: NextRequest) {
  let returnTo = cartShakePath();
  const contentType = request.headers.get("content-type") ?? "";
  if (
    contentType.includes("form") ||
    contentType.includes("urlencoded") ||
    contentType.includes("multipart")
  ) {
    try {
      const form = await request.formData();
      returnTo = safeReturnTo(String(form.get("returnTo") ?? cartShakePath()));
    } catch {
      returnTo = cartShakePath();
    }
  }

  const cartIds = parseCartListingIds(
    request.cookies.get(CART_COOKIE_NAME)?.value,
  );
  const result = shakeCartListingIds(cartIds);

  const target = new URL(returnTo, originFrom(request));
  if (target.pathname === cartShakePath()) {
    target.searchParams.set("shook", result.notice);
  }

  const response = NextResponse.redirect(target, 303);
  response.cookies.set({
    name: CART_COOKIE_NAME,
    value: cartCookieValue(result.listingIds),
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}

export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL(cartShakePath(), originFrom(request)), 303);
}
