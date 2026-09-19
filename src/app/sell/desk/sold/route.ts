import { NextResponse, type NextRequest } from "next/server";

import { listingById } from "@/lib/commerce";
import { sellDeskPath } from "@/lib/paths";
import { sellerListingById } from "@/lib/seller-overlay";
import {
  markListingSold,
  parseSoldListingIds,
  readSoldListingIds,
  restockListing,
  SOLD_COOKIE_NAME,
  soldCookieValue,
  writeSoldListingIds,
} from "@/lib/sold-overlay";

function safeReturnTo(value: string) {
  if (value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return sellDeskPath();
}

function liveListing(listingId: string) {
  return listingById(listingId) ?? sellerListingById(listingId);
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const listingId = String(form.get("listingId") ?? "");
  const intent = String(form.get("intent") ?? "sold");
  const returnTo = safeReturnTo(String(form.get("returnTo") ?? sellDeskPath()));
  const current = [
    ...new Set([
      ...parseSoldListingIds(request.cookies.get(SOLD_COOKIE_NAME)?.value),
      ...readSoldListingIds(),
    ]),
  ];
  const listing = liveListing(listingId);
  const result =
    intent === "open"
      ? restockListing(listing, current)
      : markListingSold(listing, current);

  const referer = request.headers.get("referer");
  const origin =
    request.headers.get("origin") ??
    (referer ? new URL(referer).origin : request.nextUrl.origin);
  const response = NextResponse.redirect(new URL(returnTo, origin), 303);

  if (result.ok) {
    writeSoldListingIds(result.listingIds);
    response.cookies.set({
      name: SOLD_COOKIE_NAME,
      value: soldCookieValue(result.listingIds),
      path: "/",
      sameSite: "lax",
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return response;
}
