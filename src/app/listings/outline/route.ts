import { NextResponse, type NextRequest } from "next/server";

import { listingById } from "@/lib/commerce";
import {
  OUTLINE_COOKIE_NAME,
  clearListingOutline,
  markListingOutline,
  outlineCookieValue,
  parseOutlineListingIds,
  readOutlineListingIds,
  writeOutlineListingIds,
} from "@/lib/listing-outline";
import { listingOutlinePath } from "@/lib/paths";

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
  return listingOutlinePath(listingId || "missing");
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const listingId = String(form.get("listingId") ?? "").trim();
  const intent = String(form.get("intent") ?? "outline").trim().toLowerCase();
  const returnTo = safeReturnTo(
    String(form.get("returnTo") ?? listingOutlinePath(listingId || "missing")),
    listingId,
  );
  const current = [
    ...new Set([
      ...parseOutlineListingIds(
        request.cookies.get(OUTLINE_COOKIE_NAME)?.value,
      ),
      ...readOutlineListingIds(),
    ]),
  ];
  const listing = listingById(listingId);
  const listingIds =
    intent === "open"
      ? clearListingOutline(listing, current)
      : markListingOutline(listing, current);

  const response = NextResponse.redirect(
    new URL(returnTo, originFrom(request)),
    303,
  );

  if (!listingIds) {
    return response;
  }

  // Cookie is always a string[] JSON, never `{ ok, listingIds }`.
  writeOutlineListingIds(listingIds);
  response.cookies.set({
    name: OUTLINE_COOKIE_NAME,
    value: outlineCookieValue(listingIds),
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}

export async function GET(request: NextRequest) {
  const listingId = request.nextUrl.searchParams.get("listingId")?.trim();
  const target = listingId ? listingOutlinePath(listingId) : "/explore";
  return NextResponse.redirect(new URL(target, originFrom(request)), 303);
}
