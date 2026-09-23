import { NextResponse, type NextRequest } from "next/server";

import {
  CART_COOKIE_NAME,
  cartCookieValue,
  parseCartListingIds,
} from "@/lib/cart";
import { savedPath } from "@/lib/paths";
import { parseSavedListingIds, SAVED_COOKIE_NAME } from "@/lib/saved";
import { bagSavedListingIds } from "@/lib/saved-bag";

function originFrom(request: NextRequest) {
  const fromOrigin = request.headers.get("origin");
  if (fromOrigin) return fromOrigin;
  const referer = request.headers.get("referer");
  if (referer) return new URL(referer).origin;
  return request.nextUrl.origin;
}

function send(request: NextRequest, bag: "scooped" | "empty", cartIds?: string[]) {
  const target = new URL(savedPath(), originFrom(request));
  target.searchParams.set("bag", bag);
  const response = NextResponse.redirect(target, 303);
  if (cartIds) {
    response.cookies.set({
      name: CART_COOKIE_NAME,
      value: cartCookieValue(cartIds),
      path: "/",
      sameSite: "lax",
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return response;
}

export async function POST(request: NextRequest) {
  const savedIds = parseSavedListingIds(
    request.cookies.get(SAVED_COOKIE_NAME)?.value,
  );
  const cartIds = parseCartListingIds(
    request.cookies.get(CART_COOKIE_NAME)?.value,
  );
  const result = bagSavedListingIds(savedIds, cartIds);

  if (result.eligible.length === 0) {
    return send(request, "empty");
  }

  return send(request, "scooped", result.listingIds);
}

export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL(savedPath(), originFrom(request)), 303);
}
