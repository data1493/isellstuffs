import { NextResponse, type NextRequest } from "next/server";

import { listingById } from "@/lib/commerce";
import { sellDeskPath } from "@/lib/paths";
import { sellerListingById } from "@/lib/seller-overlay";
import {
  dropWeekendListing,
  parseWeekendPinIds,
  pinWeekendListing,
  readWeekendPinIds,
  WEEKEND_PINS_COOKIE_NAME,
  weekendPinCookieValue,
  writeWeekendPinIds,
} from "@/lib/weekend-table-pin";

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
  const intent = String(form.get("intent") ?? "pin");
  const returnTo = safeReturnTo(String(form.get("returnTo") ?? sellDeskPath()));
  const current = [
    ...new Set([
      ...parseWeekendPinIds(request.cookies.get(WEEKEND_PINS_COOKIE_NAME)?.value),
      ...readWeekendPinIds(),
    ]),
  ];
  const listing = liveListing(listingId);
  const result =
    intent === "drop"
      ? dropWeekendListing(listingId, current)
      : pinWeekendListing(listing, current);

  const referer = request.headers.get("referer");
  const origin =
    request.headers.get("origin") ??
    (referer ? new URL(referer).origin : request.nextUrl.origin);
  const response = NextResponse.redirect(new URL(returnTo, origin), 303);

  if (result.ok) {
    writeWeekendPinIds(result.listingIds);
    response.cookies.set({
      name: WEEKEND_PINS_COOKIE_NAME,
      value: weekendPinCookieValue(result.listingIds),
      path: "/",
      sameSite: "lax",
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return response;
}
