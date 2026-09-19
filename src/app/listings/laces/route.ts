import { NextResponse, type NextRequest } from "next/server";

import { listingById } from "@/lib/commerce";
import {
  LACES_COOKIE_NAME,
  clearListingLaces,
  listingLacesCookieValue,
  mergeListingLacesMaps,
  parseListingLaces,
  readListingLaces,
  tapeListingLaces,
  writeListingLaces,
} from "@/lib/listing-laces";
import { listingLacesPath } from "@/lib/paths";

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
  return listingLacesPath(listingId || "missing");
}

function send(request: NextRequest, path: string, cookieValue?: string) {
  const response = NextResponse.redirect(new URL(path, originFrom(request)), 303);
  if (cookieValue !== undefined) {
    response.cookies.set({
      name: LACES_COOKIE_NAME,
      value: cookieValue,
      path: "/",
      sameSite: "lax",
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return response;
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const listingId = String(form.get("listingId") ?? "").trim();
  const intent = String(form.get("intent") ?? "tape").trim().toLowerCase();
  const fallback = listingLacesPath(listingId || "missing");
  const returnTo = safeReturnTo(
    String(form.get("returnTo") ?? fallback),
    listingId,
  );
  const current = mergeListingLacesMaps(
    parseListingLaces(request.cookies.get(LACES_COOKIE_NAME)?.value),
    readListingLaces(),
  );
  const listing = listingById(listingId);

  if (intent === "clear") {
    const result = clearListingLaces(listing, current);
    if (!result.ok) {
      return send(request, fallback);
    }
    writeListingLaces(result.map);
    return send(request, returnTo, listingLacesCookieValue(result.map));
  }

  const result = tapeListingLaces(
    listing,
    current,
    String(form.get("note") ?? ""),
  );
  if (!result.ok) {
    if (result.reason === "empty" && listing) {
      const target = new URL(listingLacesPath(listing.id), originFrom(request));
      target.searchParams.set("error", "empty");
      return NextResponse.redirect(target, 303);
    }
    return send(request, fallback);
  }

  writeListingLaces(result.map);
  return send(request, returnTo, listingLacesCookieValue(result.map));
}

export async function GET(request: NextRequest) {
  const listingId = request.nextUrl.searchParams.get("listingId")?.trim();
  const target = listingId ? listingLacesPath(listingId) : "/explore";
  return NextResponse.redirect(new URL(target, originFrom(request)), 303);
}
