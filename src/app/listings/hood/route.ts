import { NextResponse, type NextRequest } from "next/server";

import { listingById } from "@/lib/commerce";
import {
  HOOD_COOKIE_NAME,
  clearListingHood,
  hoodCookieValue,
  markListingHood,
  parseHoodListingIds,
  readHoodListingIds,
  writeHoodListingIds,
} from "@/lib/listing-hood";
import { listingHoodPath } from "@/lib/paths";

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
  return listingHoodPath(listingId || "missing");
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const listingId = String(form.get("listingId") ?? "").trim();
  const intent = String(form.get("intent") ?? "hood").trim().toLowerCase();
  const returnTo = safeReturnTo(
    String(form.get("returnTo") ?? listingHoodPath(listingId || "missing")),
    listingId,
  );
  const current = [
    ...new Set([
      ...parseHoodListingIds(request.cookies.get(HOOD_COOKIE_NAME)?.value),
      ...readHoodListingIds(),
    ]),
  ];
  const listing = listingById(listingId);
  const result =
    intent === "open"
      ? clearListingHood(listing, current)
      : markListingHood(listing, current);

  const response = NextResponse.redirect(new URL(returnTo, originFrom(request)), 303);

  if (!result.ok) {
    return response;
  }

  const listingIds = result.listingIds;
  // Cookie stays `string[]`. A write-result literal 500s the PDP on `.includes`.
  if (!Array.isArray(listingIds)) {
    return response;
  }

  writeHoodListingIds(listingIds);
  response.cookies.set({
    name: HOOD_COOKIE_NAME,
    value: hoodCookieValue(listingIds),
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}

export async function GET(request: NextRequest) {
  const listingId = request.nextUrl.searchParams.get("listingId")?.trim();
  const target = listingId ? listingHoodPath(listingId) : "/explore";
  return NextResponse.redirect(new URL(target, originFrom(request)), 303);
}
