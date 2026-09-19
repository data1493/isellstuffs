import { NextResponse, type NextRequest } from "next/server";

import { listingById } from "@/lib/commerce";
import {
  SCAN_COOKIE_NAME,
  pairScanListings,
  parseScanPairs,
  readScanPairs,
  scanCookieValue,
  uniqueScanPairs,
  unpairScanListing,
  writeScanPairs,
} from "@/lib/listing-scan";
import { listingScanPath } from "@/lib/paths";

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
  return listingScanPath(listingId || "missing");
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const listingId = String(form.get("listingId") ?? "").trim();
  const mateId = String(form.get("mateId") ?? "").trim();
  const intent = String(form.get("intent") ?? "scan").trim().toLowerCase();
  const returnTo = safeReturnTo(
    String(form.get("returnTo") ?? listingScanPath(listingId || "missing")),
    listingId,
  );
  const current = uniqueScanPairs([
    ...parseScanPairs(request.cookies.get(SCAN_COOKIE_NAME)?.value),
    ...readScanPairs(),
  ]);
  const listing = listingById(listingId);
  const result =
    intent === "apart"
      ? unpairScanListing(listing, current)
      : pairScanListings(listing, listingById(mateId), current);

  const response = NextResponse.redirect(new URL(returnTo, originFrom(request)), 303);

  if (!result.ok) {
    return response;
  }

  writeScanPairs(result.pairs);
  response.cookies.set({
    name: SCAN_COOKIE_NAME,
    value: scanCookieValue(result.pairs),
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}

export async function GET(request: NextRequest) {
  const listingId = request.nextUrl.searchParams.get("listingId")?.trim();
  const target = listingId ? listingScanPath(listingId) : "/explore";
  return NextResponse.redirect(new URL(target, originFrom(request)), 303);
}
