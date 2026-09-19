import { NextResponse, type NextRequest } from "next/server";

import { listingById } from "@/lib/commerce";
import {
  CARDS_COOKIE_NAME,
  cardsCookieValue,
  clearListingCards,
  markListingCards,
  parseCardsListingIds,
  readCardsListingIds,
  writeCardsListingIds,
} from "@/lib/listing-cards";
import { listingCardsPath } from "@/lib/paths";

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
  return listingCardsPath(listingId || "missing");
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const listingId = String(form.get("listingId") ?? "").trim();
  const intent = String(form.get("intent") ?? "cards").trim().toLowerCase();
  const returnTo = safeReturnTo(
    String(form.get("returnTo") ?? listingCardsPath(listingId || "missing")),
    listingId,
  );
  const current = [
    ...new Set([
      ...parseCardsListingIds(request.cookies.get(CARDS_COOKIE_NAME)?.value),
      ...readCardsListingIds(),
    ]),
  ];
  const listing = listingById(listingId);
  const result =
    intent === "open"
      ? clearListingCards(listing, current)
      : markListingCards(listing, current);

  const response = NextResponse.redirect(new URL(returnTo, originFrom(request)), 303);

  if (!result.ok) {
    return response;
  }

  writeCardsListingIds(result.listingIds);
  response.cookies.set({
    name: CARDS_COOKIE_NAME,
    value: cardsCookieValue(result.listingIds),
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}

export async function GET(request: NextRequest) {
  const listingId = request.nextUrl.searchParams.get("listingId")?.trim();
  const target = listingId ? listingCardsPath(listingId) : "/explore";
  return NextResponse.redirect(new URL(target, originFrom(request)), 303);
}
