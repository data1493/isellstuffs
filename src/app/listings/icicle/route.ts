import { NextResponse, type NextRequest } from "next/server";

import { listingById } from "@/lib/commerce";
import {
  ICICLE_COOKIE_NAME,
  clearListingIcicle,
  icicleCookieValue,
  markListingIcicle,
  parseIcicleListingIds,
  readIcicleListingIds,
  writeIcicleListingIds,
} from "@/lib/listing-icicle";
import { listingIciclePath } from "@/lib/paths";

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
  return listingIciclePath(listingId || "missing");
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const listingId = String(form.get("listingId") ?? "").trim();
  const intent = String(form.get("intent") ?? "icicle").trim().toLowerCase();
  const returnTo = safeReturnTo(
    String(form.get("returnTo") ?? listingIciclePath(listingId || "missing")),
    listingId,
  );
  const current = [
    ...new Set([
      ...parseIcicleListingIds(request.cookies.get(ICICLE_COOKIE_NAME)?.value),
      ...readIcicleListingIds(),
    ]),
  ];
  const listing = listingById(listingId);
  const listingIds =
    intent === "open"
      ? clearListingIcicle(listing, current)
      : markListingIcicle(listing, current);

  const response = NextResponse.redirect(
    new URL(returnTo, originFrom(request)),
    303,
  );

  if (!listingIds) {
    return response;
  }

  // Cookie is always a string[] JSON, never `{ ok, listingIds }`.
  // Never write leftover dewet, pillow, fringe, rake, opbd, race,
  // mistrack, fizeau, frost, billboard, reflex, ltsh, flywheel,
  // tombstone, squeegee, pogo, underfill, or reball cookies.
  writeIcicleListingIds(listingIds);
  response.cookies.set({
    name: ICICLE_COOKIE_NAME,
    value: icicleCookieValue(listingIds),
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}

export async function GET(request: NextRequest) {
  const listingId = request.nextUrl.searchParams.get("listingId")?.trim();
  const target = listingId ? listingIciclePath(listingId) : "/explore";
  return NextResponse.redirect(new URL(target, originFrom(request)), 303);
}
