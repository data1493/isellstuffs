import { NextResponse, type NextRequest } from "next/server";

import { listingById } from "@/lib/commerce";
import {
  CAST_COOKIE_NAME,
  castCookieValue,
  clearListingCast,
  markListingCast,
  parseCastListingIds,
  readCastListingIds,
  writeCastListingIds,
} from "@/lib/listing-cast";
import { listingCastPath } from "@/lib/paths";

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
  return listingCastPath(listingId || "missing");
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const listingId = String(form.get("listingId") ?? "").trim();
  const intent = String(form.get("intent") ?? "cast").trim().toLowerCase();
  const returnTo = safeReturnTo(
    String(form.get("returnTo") ?? listingCastPath(listingId || "missing")),
    listingId,
  );
  const current = [
    ...new Set([
      ...parseCastListingIds(request.cookies.get(CAST_COOKIE_NAME)?.value),
      ...readCastListingIds(),
    ]),
  ];
  const listing = listingById(listingId);
  const result =
    intent === "open"
      ? clearListingCast(listing, current)
      : markListingCast(listing, current);

  const response = NextResponse.redirect(new URL(returnTo, originFrom(request)), 303);

  if (!result.ok) {
    return response;
  }

  writeCastListingIds(result.listingIds);
  response.cookies.set({
    name: CAST_COOKIE_NAME,
    value: castCookieValue(result.listingIds),
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}

export async function GET(request: NextRequest) {
  const listingId = request.nextUrl.searchParams.get("listingId")?.trim();
  const target = listingId ? listingCastPath(listingId) : "/explore";
  return NextResponse.redirect(new URL(target, originFrom(request)), 303);
}
