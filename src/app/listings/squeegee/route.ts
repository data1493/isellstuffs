import { NextResponse, type NextRequest } from "next/server";

import { listingById } from "@/lib/commerce";
import {
  SQUEEGEE_COOKIE_NAME,
  clearListingSqueegee,
  markListingSqueegee,
  parseSqueegeeListingIds,
  readSqueegeeListingIds,
  squeegeeCookieValue,
  writeSqueegeeListingIds,
} from "@/lib/listing-squeegee";
import { listingSqueegeePath } from "@/lib/paths";

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
  return listingSqueegeePath(listingId || "missing");
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const listingId = String(form.get("listingId") ?? "").trim();
  const intent = String(form.get("intent") ?? "squeegee").trim().toLowerCase();
  const returnTo = safeReturnTo(
    String(form.get("returnTo") ?? listingSqueegeePath(listingId || "missing")),
    listingId,
  );
  const current = [
    ...new Set([
      ...parseSqueegeeListingIds(request.cookies.get(SQUEEGEE_COOKIE_NAME)?.value),
      ...readSqueegeeListingIds(),
    ]),
  ];
  const listing = listingById(listingId);
  const listingIds =
    intent === "open"
      ? clearListingSqueegee(listing, current)
      : markListingSqueegee(listing, current);

  const response = NextResponse.redirect(
    new URL(returnTo, originFrom(request)),
    303,
  );

  if (!listingIds) {
    return response;
  }

  // Cookie is always a string[] JSON, never `{ ok, listingIds }`.
  // Never write dam, globtop, acf, soak, hotbar, pogo, underfill, or reball cookies.
  writeSqueegeeListingIds(listingIds);
  response.cookies.set({
    name: SQUEEGEE_COOKIE_NAME,
    value: squeegeeCookieValue(listingIds),
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}

export async function GET(request: NextRequest) {
  const listingId = request.nextUrl.searchParams.get("listingId")?.trim();
  const target = listingId ? listingSqueegeePath(listingId) : "/explore";
  return NextResponse.redirect(new URL(target, originFrom(request)), 303);
}
