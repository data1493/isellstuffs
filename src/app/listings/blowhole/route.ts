import { NextResponse, type NextRequest } from "next/server";

import { listingById } from "@/lib/commerce";
import {
  BLOWHOLE_COOKIE_NAME,
  clearListingBlowhole,
  blowholeCookieValue,
  markListingBlowhole,
  parseBlowholeListingIds,
  readBlowholeListingIds,
  writeBlowholeListingIds,
} from "@/lib/listing-blowhole";
import { listingBlowholePath } from "@/lib/paths";

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
  return listingBlowholePath(listingId || "missing");
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const listingId = String(form.get("listingId") ?? "").trim();
  const intent = String(form.get("intent") ?? "blowhole").trim().toLowerCase();
  const returnTo = safeReturnTo(
    String(form.get("returnTo") ?? listingBlowholePath(listingId || "missing")),
    listingId,
  );
  const current = [
    ...new Set([
      ...parseBlowholeListingIds(request.cookies.get(BLOWHOLE_COOKIE_NAME)?.value),
      ...readBlowholeListingIds(),
    ]),
  ];
  const listing = listingById(listingId);
  const listingIds =
    intent === "open"
      ? clearListingBlowhole(listing, current)
      : markListingBlowhole(listing, current);

  const response = NextResponse.redirect(
    new URL(returnTo, originFrom(request)),
    303,
  );

  if (!listingIds) {
    return response;
  }

  // Cookie is always a string[] JSON, never `{ ok, listingIds }`.
  // Never write leftover icicle, dewet, pillow, fringe, rake, opbd,
  // race, mistrack, fizeau, frost, billboard, reflex, ltsh,
  // flywheel, eccentric, haidinger, pclt, eddy, tombstone,
  // squeegee, pogo, underfill, or reball cookies.
  writeBlowholeListingIds(listingIds);
  response.cookies.set({
    name: BLOWHOLE_COOKIE_NAME,
    value: blowholeCookieValue(listingIds),
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}

export async function GET(request: NextRequest) {
  const listingId = request.nextUrl.searchParams.get("listingId")?.trim();
  const target = listingId ? listingBlowholePath(listingId) : "/explore";
  return NextResponse.redirect(new URL(target, originFrom(request)), 303);
}
