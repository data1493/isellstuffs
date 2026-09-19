import { NextResponse, type NextRequest } from "next/server";

import {
  CART_COOKIE_NAME,
  cartCookieValue,
  parseCartListingIds,
} from "@/lib/cart";
import { listingById } from "@/lib/commerce";
import {
  LOOK_COOKIE_NAME,
  lookCookieValue,
  markListingLook,
  parseLookListingIds,
  readLookListingIds,
  sellAgainListing,
  writeLookListingIds,
} from "@/lib/look-overlay";
import { listingLookPath } from "@/lib/paths";
import { sellerListingById } from "@/lib/seller-overlay";

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

function safeReturnTo(value: string, listingId: string) {
  if (value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return listingLookPath(listingId || "missing");
}

function liveListing(listingId: string) {
  return listingById(listingId) ?? sellerListingById(listingId);
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const listingId = String(form.get("listingId") ?? "").trim();
  const intent = String(form.get("intent") ?? "look").trim().toLowerCase();
  const returnTo = safeReturnTo(
    String(form.get("returnTo") ?? listingLookPath(listingId || "missing")),
    listingId,
  );
  const current = [
    ...new Set([
      ...parseLookListingIds(request.cookies.get(LOOK_COOKIE_NAME)?.value),
      ...readLookListingIds(),
    ]),
  ];
  const listing = liveListing(listingId);
  const result =
    intent === "open"
      ? sellAgainListing(listing, current)
      : markListingLook(listing, current);

  const response = NextResponse.redirect(new URL(returnTo, originFrom(request)), 303);

  if (!result.ok) {
    return response;
  }

  writeLookListingIds(result.listingIds);
  response.cookies.set({
    name: LOOK_COOKIE_NAME,
    value: lookCookieValue(result.listingIds),
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 30,
  });

  if (intent !== "open") {
    const tote = parseCartListingIds(
      request.cookies.get(CART_COOKIE_NAME)?.value,
    );
    if (tote.includes(listingId)) {
      response.cookies.set({
        name: CART_COOKIE_NAME,
        value: cartCookieValue(tote.filter((id) => id !== listingId)),
        path: "/",
        sameSite: "lax",
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 30,
      });
    }
  }

  return response;
}

export async function GET(request: NextRequest) {
  const listingId = request.nextUrl.searchParams.get("listingId")?.trim();
  const target = listingId ? listingLookPath(listingId) : "/explore";
  return NextResponse.redirect(new URL(target, originFrom(request)), 303);
}
