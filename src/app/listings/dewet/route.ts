import { NextResponse, type NextRequest } from "next/server";

import { listingById } from "@/lib/commerce";
import {
  DEWET_COOKIE_NAME,
  clearListingDewet,
  dewetCookieValue,
  markListingDewet,
  parseDewetListingIds,
  readDewetListingIds,
  writeDewetListingIds,
} from "@/lib/listing-dewet";
import { listingDewetPath } from "@/lib/paths";

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
  return listingDewetPath(listingId || "missing");
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const listingId = String(form.get("listingId") ?? "").trim();
  const intent = String(form.get("intent") ?? "dewet").trim().toLowerCase();
  const returnTo = safeReturnTo(
    String(form.get("returnTo") ?? listingDewetPath(listingId || "missing")),
    listingId,
  );
  const current = [
    ...new Set([
      ...parseDewetListingIds(request.cookies.get(DEWET_COOKIE_NAME)?.value),
      ...readDewetListingIds(),
    ]),
  ];
  const listing = listingById(listingId);
  const listingIds =
    intent === "open"
      ? clearListingDewet(listing, current)
      : markListingDewet(listing, current);

  const response = NextResponse.redirect(
    new URL(returnTo, originFrom(request)),
    303,
  );

  if (!listingIds) {
    return response;
  }

  // Cookie is always a string[] JSON, never `{ ok, listingIds }`.
  // Never write leftover pillow, fringe, rake, opbd, race, resonance,
  // frost, billboard, reflex, tombstone, squeegee, pogo, underfill,
  // or reball cookies.
  writeDewetListingIds(listingIds);
  response.cookies.set({
    name: DEWET_COOKIE_NAME,
    value: dewetCookieValue(listingIds),
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}

export async function GET(request: NextRequest) {
  const listingId = request.nextUrl.searchParams.get("listingId")?.trim();
  const target = listingId ? listingDewetPath(listingId) : "/explore";
  return NextResponse.redirect(new URL(target, originFrom(request)), 303);
}
