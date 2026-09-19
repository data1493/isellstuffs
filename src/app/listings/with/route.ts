import { NextResponse, type NextRequest } from "next/server";

import { listingById } from "@/lib/commerce";
import {
  WITH_COOKIE_NAME,
  pairListings,
  parseWithPairs,
  readWithPairs,
  uniquePairs,
  unpairListing,
  withCookieValue,
  writeWithPairs,
} from "@/lib/listing-with";
import { listingWithPath } from "@/lib/paths";

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
  return listingWithPath(listingId || "missing");
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const listingId = String(form.get("listingId") ?? "").trim();
  const mateId = String(form.get("mateId") ?? "").trim();
  const intent = String(form.get("intent") ?? "with").trim().toLowerCase();
  const returnTo = safeReturnTo(
    String(form.get("returnTo") ?? listingWithPath(listingId || "missing")),
    listingId,
  );
  const current = uniquePairs([
    ...parseWithPairs(request.cookies.get(WITH_COOKIE_NAME)?.value),
    ...readWithPairs(),
  ]);
  const listing = listingById(listingId);
  const result =
    intent === "apart"
      ? unpairListing(listing, current)
      : pairListings(listing, listingById(mateId), current);

  const response = NextResponse.redirect(new URL(returnTo, originFrom(request)), 303);

  if (!result.ok) {
    return response;
  }

  writeWithPairs(result.pairs);
  response.cookies.set({
    name: WITH_COOKIE_NAME,
    value: withCookieValue(result.pairs),
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}

export async function GET(request: NextRequest) {
  const listingId = request.nextUrl.searchParams.get("listingId")?.trim();
  const target = listingId ? listingWithPath(listingId) : "/explore";
  return NextResponse.redirect(new URL(target, originFrom(request)), 303);
}
