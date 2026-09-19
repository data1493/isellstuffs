import { NextResponse, type NextRequest } from "next/server";

import {
  OFFER_COOKIE_NAME,
  parseListingOffers,
  peelOffer,
  serializeListingOffers,
} from "@/lib/listing-offer";
import { listingOfferPath } from "@/lib/paths";

function safeReturnTo(value: string, fallback: string) {
  if (value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return fallback;
}

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

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const form = await request.formData();
  const offerId = String(form.get("offerId") ?? "");
  const fallback = listingOfferPath(id);
  const returnTo = safeReturnTo(String(form.get("returnTo") ?? fallback), fallback);
  const existing = parseListingOffers(
    request.cookies.get(OFFER_COOKIE_NAME)?.value,
  );
  const offers = peelOffer(existing, offerId);

  const response = NextResponse.redirect(
    new URL(returnTo, originFrom(request)),
    303,
  );
  response.cookies.set({
    name: OFFER_COOKIE_NAME,
    value: serializeListingOffers(offers),
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return NextResponse.redirect(
    new URL(listingOfferPath(id), originFrom(request)),
    303,
  );
}
