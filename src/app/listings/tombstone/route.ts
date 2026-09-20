import { NextResponse, type NextRequest } from "next/server";

import { listingById } from "@/lib/commerce";
import {
  TOMBSTONE_COOKIE_NAME,
  clearListingTombstone,
  markListingTombstone,
  parseTombstoneListingIds,
  readTombstoneListingIds,
  tombstoneCookieValue,
  writeTombstoneListingIds,
} from "@/lib/listing-tombstone";
import { listingTombstonePath } from "@/lib/paths";

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
  return listingTombstonePath(listingId || "missing");
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const listingId = String(form.get("listingId") ?? "").trim();
  const intent = String(form.get("intent") ?? "tombstone").trim().toLowerCase();
  const returnTo = safeReturnTo(
    String(form.get("returnTo") ?? listingTombstonePath(listingId || "missing")),
    listingId,
  );
  const current = [
    ...new Set([
      ...parseTombstoneListingIds(request.cookies.get(TOMBSTONE_COOKIE_NAME)?.value),
      ...readTombstoneListingIds(),
    ]),
  ];
  const listing = listingById(listingId);
  const listingIds =
    intent === "open"
      ? clearListingTombstone(listing, current)
      : markListingTombstone(listing, current);

  const response = NextResponse.redirect(
    new URL(returnTo, originFrom(request)),
    303,
  );

  if (!listingIds) {
    return response;
  }

  // Cookie is always a string[] JSON, never `{ ok, listingIds }`.
  // Never write squeegee, dam, globtop, acf, soak, hotbar, pogo, underfill, or reball cookies.
  writeTombstoneListingIds(listingIds);
  response.cookies.set({
    name: TOMBSTONE_COOKIE_NAME,
    value: tombstoneCookieValue(listingIds),
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}

export async function GET(request: NextRequest) {
  const listingId = request.nextUrl.searchParams.get("listingId")?.trim();
  const target = listingId ? listingTombstonePath(listingId) : "/explore";
  return NextResponse.redirect(new URL(target, originFrom(request)), 303);
}
