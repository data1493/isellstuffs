import { NextResponse, type NextRequest } from "next/server";

import { listingById } from "@/lib/commerce";
import {
  UNDERFILL_COOKIE_NAME,
  clearListingUnderfill,
  markListingUnderfill,
  parseUnderfillListingIds,
  readUnderfillListingIds,
  underfillCookieValue,
  writeUnderfillListingIds,
} from "@/lib/listing-underfill";
import { listingUnderfillPath } from "@/lib/paths";

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
  return listingUnderfillPath(listingId || "missing");
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const listingId = String(form.get("listingId") ?? "").trim();
  const intent = String(form.get("intent") ?? "underfill").trim().toLowerCase();
  const returnTo = safeReturnTo(
    String(form.get("returnTo") ?? listingUnderfillPath(listingId || "missing")),
    listingId,
  );
  const current = [
    ...new Set([
      ...parseUnderfillListingIds(request.cookies.get(UNDERFILL_COOKIE_NAME)?.value),
      ...readUnderfillListingIds(),
    ]),
  ];
  const listing = listingById(listingId);
  const listingIds =
    intent === "open"
      ? clearListingUnderfill(listing, current)
      : markListingUnderfill(listing, current);

  const response = NextResponse.redirect(new URL(returnTo, originFrom(request)), 303);

  if (!listingIds) {
    return response;
  }

  // Cookie is always a string[] JSON, never `{ ok, listingIds }`.
  // Never write pogo, clock, reball, reflow, flux, tin, torque, or descreen cookies.
  writeUnderfillListingIds(listingIds);
  response.cookies.set({
    name: UNDERFILL_COOKIE_NAME,
    value: underfillCookieValue(listingIds),
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}

export async function GET(request: NextRequest) {
  const listingId = request.nextUrl.searchParams.get("listingId")?.trim();
  const target = listingId ? listingUnderfillPath(listingId) : "/explore";
  return NextResponse.redirect(new URL(target, originFrom(request)), 303);
}
