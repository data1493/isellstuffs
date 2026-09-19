import { NextResponse, type NextRequest } from "next/server";

import { listingById } from "@/lib/commerce";
import {
  GASKET_COOKIE_NAME,
  clearListingGasket,
  gasketCookieValue,
  markListingGasket,
  parseGasketListingIds,
  readGasketListingIds,
  writeGasketListingIds,
} from "@/lib/listing-gasket";
import { listingGasketPath } from "@/lib/paths";

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
  return listingGasketPath(listingId || "missing");
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const listingId = String(form.get("listingId") ?? "").trim();
  const intent = String(form.get("intent") ?? "gasket").trim().toLowerCase();
  const returnTo = safeReturnTo(
    String(form.get("returnTo") ?? listingGasketPath(listingId || "missing")),
    listingId,
  );
  const current = [
    ...new Set([
      ...parseGasketListingIds(request.cookies.get(GASKET_COOKIE_NAME)?.value),
      ...readGasketListingIds(),
    ]),
  ];
  const listing = listingById(listingId);
  const result =
    intent === "open"
      ? clearListingGasket(listing, current)
      : markListingGasket(listing, current);

  const response = NextResponse.redirect(new URL(returnTo, originFrom(request)), 303);

  if (!result.ok) {
    return response;
  }

  const listingIds = result.listingIds;
  // Cookie stays `string[]`. A write-result literal 500s the PDP on `.includes`.
  if (!Array.isArray(listingIds)) {
    return response;
  }

  writeGasketListingIds(listingIds);
  response.cookies.set({
    name: GASKET_COOKIE_NAME,
    value: gasketCookieValue(listingIds),
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}

export async function GET(request: NextRequest) {
  const listingId = request.nextUrl.searchParams.get("listingId")?.trim();
  const target = listingId ? listingGasketPath(listingId) : "/explore";
  return NextResponse.redirect(new URL(target, originFrom(request)), 303);
}
