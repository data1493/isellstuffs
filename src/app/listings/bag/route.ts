import { NextResponse, type NextRequest } from "next/server";

import {
  addListingIdToCart,
  CART_COOKIE_NAME,
  cartCookieValue,
  parseCartListingIds,
} from "@/lib/cart";

function safeReturnTo(value: string) {
  if (value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return "/";
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const listingId = String(form.get("listingId") ?? "");
  const returnTo = safeReturnTo(String(form.get("returnTo") ?? "/"));
  const current = parseCartListingIds(
    request.cookies.get(CART_COOKIE_NAME)?.value,
  );
  const result = addListingIdToCart(listingId, current);

  const referer = request.headers.get("referer");
  const origin =
    request.headers.get("origin") ??
    (referer ? new URL(referer).origin : request.nextUrl.origin);
  const response = NextResponse.redirect(new URL(returnTo, origin), 303);
  if (result.ok) {
    response.cookies.set({
      name: CART_COOKIE_NAME,
      value: cartCookieValue(result.listingIds),
      path: "/",
      sameSite: "lax",
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return response;
}
