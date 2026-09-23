import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { CART_COOKIE_NAME, parseCartListingIds } from "@/lib/cart";
import {
  CHECKOUT_COOKIE,
  CHECKOUT_COOKIE_MAX_AGE,
  CheckoutError,
  serializeCheckoutSession,
} from "@/lib/checkout";
import { createCheckoutSession } from "@/lib/create-checkout-session";

function requestOrigin(request: NextRequest): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedHost) {
    return `${forwardedProto ?? "http"}://${forwardedHost}`;
  }
  return request.nextUrl.origin;
}

export async function POST(request: NextRequest) {
  const origin = requestOrigin(request);

  try {
    const form = await request.formData();
    const posted = form
      .getAll("listingId")
      .filter((value): value is string => typeof value === "string" && value.length > 0);
    const listingIds =
      posted.length > 0
        ? posted
        : parseCartListingIds(request.cookies.get(CART_COOKIE_NAME)?.value);

    const { url, session } = await createCheckoutSession(listingIds, origin);

    const jar = await cookies();
    jar.set(CHECKOUT_COOKIE, serializeCheckoutSession(session), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: CHECKOUT_COOKIE_MAX_AGE,
    });

    return NextResponse.redirect(url, 303);
  } catch (error) {
    const message =
      error instanceof CheckoutError
        ? error.message
        : error instanceof Error
          ? error.message
          : "Checkout could not start.";
    const back = new URL("/cart", origin);
    back.searchParams.set("error", message);
    return NextResponse.redirect(back, 303);
  }
}
