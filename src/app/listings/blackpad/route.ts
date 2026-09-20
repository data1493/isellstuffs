import { NextResponse, type NextRequest } from "next/server";

import { listingById } from "@/lib/commerce";
import {
  BLACKPAD_COOKIE_NAME,
  clearListingBlackpad,
  blackpadCookieValue,
  markListingBlackpad,
  parseBlackpadListingIds,
  readBlackpadListingIds,
  writeBlackpadListingIds,
} from "@/lib/listing-blackpad";
import { listingBlackpadPath } from "@/lib/paths";

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
  return listingBlackpadPath(listingId || "missing");
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const listingId = String(form.get("listingId") ?? "").trim();
  const intent = String(form.get("intent") ?? "blackpad").trim().toLowerCase();
  const returnTo = safeReturnTo(
    String(form.get("returnTo") ?? listingBlackpadPath(listingId || "missing")),
    listingId,
  );
  const current = [
    ...new Set([
      ...parseBlackpadListingIds(request.cookies.get(BLACKPAD_COOKIE_NAME)?.value),
      ...readBlackpadListingIds(),
    ]),
  ];
  const listing = listingById(listingId);
  const listingIds =
    intent === "open"
      ? clearListingBlackpad(listing, current)
      : markListingBlackpad(listing, current);

  const response = NextResponse.redirect(
    new URL(returnTo, originFrom(request)),
    303,
  );

  if (!listingIds) {
    return response;
  }

  // Cookie is always a string[] JSON, never `{ ok, listingIds }`.
  // Never write leftover blowhole, leftover mother, leftover brewster,
  // leftover pclt, leftover eddy, leftover eccentric, leftover
  // haidinger, leftover icicle, leftover frost, leftover billboard,
  // leftover reflex, leftover dewet, leftover pillow, leftover
  // tombstone, leftover squeegee, leftover pogo, leftover underfill,
  // leftover reball, ebdt, or stator cookies.
  writeBlackpadListingIds(listingIds);
  response.cookies.set({
    name: BLACKPAD_COOKIE_NAME,
    value: blackpadCookieValue(listingIds),
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}

export async function GET(request: NextRequest) {
  const listingId = request.nextUrl.searchParams.get("listingId")?.trim();
  const target = listingId ? listingBlackpadPath(listingId) : "/explore";
  return NextResponse.redirect(new URL(target, originFrom(request)), 303);
}
