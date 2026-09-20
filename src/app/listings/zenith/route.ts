import { NextResponse, type NextRequest } from "next/server";

import { listingById } from "@/lib/commerce";
import {
  ZENITH_COOKIE_NAME,
  clearListingZenith,
  markListingZenith,
  parseZenithListingIds,
  readZenithListingIds,
  writeZenithListingIds,
  zenithCookieValue,
} from "@/lib/listing-zenith";
import { listingZenithPath } from "@/lib/paths";

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
  return listingZenithPath(listingId || "missing");
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const listingId = String(form.get("listingId") ?? "").trim();
  const intent = String(form.get("intent") ?? "zenith").trim().toLowerCase();
  const returnTo = safeReturnTo(
    String(form.get("returnTo") ?? listingZenithPath(listingId || "missing")),
    listingId,
  );
  const current = [
    ...new Set([
      ...parseZenithListingIds(request.cookies.get(ZENITH_COOKIE_NAME)?.value),
      ...readZenithListingIds(),
    ]),
  ];
  const listing = listingById(listingId);
  const listingIds =
    intent === "open"
      ? clearListingZenith(listing, current)
      : markListingZenith(listing, current);

  const response = NextResponse.redirect(new URL(returnTo, originFrom(request)), 303);

  if (!listingIds) {
    return response;
  }

  // Cookie is always a string[] JSON, never `{ ok, listingIds }`.
  // Never write vacuum, azimuth, overhang, bias, flutter, or torque cookies.
  writeZenithListingIds(listingIds);
  response.cookies.set({
    name: ZENITH_COOKIE_NAME,
    value: zenithCookieValue(listingIds),
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}

export async function GET(request: NextRequest) {
  const listingId = request.nextUrl.searchParams.get("listingId")?.trim();
  const target = listingId ? listingZenithPath(listingId) : "/explore";
  return NextResponse.redirect(new URL(target, originFrom(request)), 303);
}
