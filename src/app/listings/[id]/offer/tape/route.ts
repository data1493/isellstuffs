import { NextResponse, type NextRequest } from "next/server";

import {
  OFFER_COOKIE_NAME,
  parseListingOffers,
  serializeListingOffers,
  tapeOffer,
} from "@/lib/listing-offer";
import { listingOfferPath } from "@/lib/paths";

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
      name: OFFER_COOKIE_NAME,
      value: cookieValue,
      path: "/",
      sameSite: "lax",
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return response;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const form = await request.formData();
  const amount = String(form.get("amount") ?? "");
  const existing = parseListingOffers(
    request.cookies.get(OFFER_COOKIE_NAME)?.value,
  );
  const result = tapeOffer(existing, id, amount);
  const slip = listingOfferPath(id);

  if (!result.ok) {
    if (result.reason === "empty") {
      return send(request, `${slip}?error=empty`);
    }
    if (result.reason === "sold") {
      return send(request, `${slip}?error=sold`);
    }
    return send(request, slip);
  }

  return send(request, slip, serializeListingOffers(result.offers));
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return send(request, listingOfferPath(id));
}
