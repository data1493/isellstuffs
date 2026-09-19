import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { parseCartListingIds } from "@/lib/cart";
import {
  CHECKOUT_COOKIE,
  CHECKOUT_COOKIE_MAX_AGE,
  CheckoutError,
  checkoutMode,
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

export async function GET() {
  try {
    const publishable = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() ?? "";
    return NextResponse.json({
      mode: checkoutMode(),
      chargePattern: "separate_charges_and_transfers",
      stripeJs: publishable.startsWith("pk_test_"),
    });
  } catch (error) {
    if (error instanceof CheckoutError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { listingIds?: unknown };
    const listingIds = parseCartListingIds(JSON.stringify(body.listingIds ?? []));
    const { url, session } = await createCheckoutSession(
      listingIds,
      requestOrigin(request),
    );

    const jar = await cookies();
    jar.set(CHECKOUT_COOKIE, serializeCheckoutSession(session), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: CHECKOUT_COOKIE_MAX_AGE,
    });

    return NextResponse.json({ url, sessionId: session.id, mode: session.mode });
  } catch (error) {
    if (error instanceof CheckoutError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    const message =
      error instanceof Error ? error.message : "Checkout could not start.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
