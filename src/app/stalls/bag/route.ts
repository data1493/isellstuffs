import { NextResponse, type NextRequest } from "next/server";

import {
  CART_COOKIE_NAME,
  cartCookieValue,
  parseCartListingIds,
} from "@/lib/cart";
import { stallPath } from "@/lib/paths";
import { bagStallListingIds, resolveBagStall } from "@/lib/stall-bag";

function originFrom(request: NextRequest) {
  const fromOrigin = request.headers.get("origin");
  if (fromOrigin) return fromOrigin;
  const referer = request.headers.get("referer");
  if (referer) return new URL(referer).origin;
  return request.nextUrl.origin;
}

function send(
  request: NextRequest,
  path: string,
  bag?: "scooped" | "empty",
  cartIds?: string[],
) {
  const target = new URL(path, originFrom(request));
  if (bag) {
    target.searchParams.set("bag", bag);
  }
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
  const form = await request.formData();
  const stallKey = String(form.get("stallId") ?? "");
  const stall = resolveBagStall(stallKey);
  const fallback = stall
    ? stallPath(stall.slug)
    : stallPath(stallKey.trim() || "missing");

  if (!stall) {
    return send(request, fallback);
  }

  const cartIds = parseCartListingIds(
    request.cookies.get(CART_COOKIE_NAME)?.value,
  );
  const result = bagStallListingIds(stall.id, cartIds);

  if (result.eligible.length === 0) {
    return send(request, stallPath(stall.slug), "empty");
  }

  return send(request, stallPath(stall.slug), "scooped", result.listingIds);
}

export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL("/explore", originFrom(request)), 303);
}
