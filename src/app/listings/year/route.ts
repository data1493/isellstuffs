import { NextResponse, type NextRequest } from "next/server";

import { listingById } from "@/lib/commerce";
import {
  YEAR_COOKIE_NAME,
  clearListingYear,
  markListingYear,
  parseYearListingIds,
  readYearListingIds,
  writeYearListingIds,
  yearCookieValue,
} from "@/lib/listing-year";
import { listingYearPath } from "@/lib/paths";

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
  return listingYearPath(listingId || "missing");
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const listingId = String(form.get("listingId") ?? "").trim();
  const intent = String(form.get("intent") ?? "year").trim().toLowerCase();
  const returnTo = safeReturnTo(
    String(form.get("returnTo") ?? listingYearPath(listingId || "missing")),
    listingId,
  );
  const current = [
    ...new Set([
      ...parseYearListingIds(request.cookies.get(YEAR_COOKIE_NAME)?.value),
      ...readYearListingIds(),
    ]),
  ];
  const listing = listingById(listingId);
  const result =
    intent === "open"
      ? clearListingYear(listing, current)
      : markListingYear(listing, current);

  const response = NextResponse.redirect(new URL(returnTo, originFrom(request)), 303);

  if (!result.ok) {
    return response;
  }

  writeYearListingIds(result.listingIds);
  response.cookies.set({
    name: YEAR_COOKIE_NAME,
    value: yearCookieValue(result.listingIds),
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}

export async function GET(request: NextRequest) {
  const listingId = request.nextUrl.searchParams.get("listingId")?.trim();
  const target = listingId ? listingYearPath(listingId) : "/explore";
  return NextResponse.redirect(new URL(target, originFrom(request)), 303);
}
