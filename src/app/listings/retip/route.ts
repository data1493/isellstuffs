import { NextResponse, type NextRequest } from "next/server";

import { listingById } from "@/lib/commerce";
import {
  RETIP_COOKIE_NAME,
  clearListingRetip,
  markListingRetip,
  parseRetipListingIds,
  readRetipListingIds,
  retipCookieValue,
  writeRetipListingIds,
} from "@/lib/listing-retip";
import { listingRetipPath } from "@/lib/paths";

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
  return listingRetipPath(listingId || "missing");
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const listingId = String(form.get("listingId") ?? "").trim();
  const intent = String(form.get("intent") ?? "retip").trim().toLowerCase();
  const returnTo = safeReturnTo(
    String(form.get("returnTo") ?? listingRetipPath(listingId || "missing")),
    listingId,
  );
  const current = [
    ...new Set([
      ...parseRetipListingIds(
        request.cookies.get(RETIP_COOKIE_NAME)?.value,
      ),
      ...readRetipListingIds(),
    ]),
  ];
  const listing = listingById(listingId);
  const listingIds =
    intent === "open"
      ? clearListingRetip(listing, current)
      : markListingRetip(listing, current);

  const response = NextResponse.redirect(
    new URL(returnTo, originFrom(request)),
    303,
  );

  if (!listingIds) {
    return response;
  }

  // Cookie is always a string[] JSON, never `{ ok, listingIds }`.
  // Never write vacuum, zenith, overhang, azimuth, relap, or flutter cookies.
  writeRetipListingIds(listingIds);
  response.cookies.set({
    name: RETIP_COOKIE_NAME,
    value: retipCookieValue(listingIds),
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}

export async function GET(request: NextRequest) {
  const listingId = request.nextUrl.searchParams.get("listingId")?.trim();
  const target = listingId ? listingRetipPath(listingId) : "/explore";
  return NextResponse.redirect(new URL(target, originFrom(request)), 303);
}
