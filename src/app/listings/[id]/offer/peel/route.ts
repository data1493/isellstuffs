import { NextResponse, type NextRequest } from "next/server";

import {
  OFFER_COOKIE_NAME,
  parseListingOffers,
  peelOffer,
  serializeListingOffers,
} from "@/lib/listing-offer";
import { listingOfferPath } from "@/lib/paths";
import { sameOriginUrl } from "@/lib/same-origin";

function safeReturnTo(value: string, fallback: string) {
  if (value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return fallback;
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
    sameOriginUrl(request, returnTo),
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
    sameOriginUrl(request, listingOfferPath(id)),
    303,
  );
}
