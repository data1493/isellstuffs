import { NextResponse, type NextRequest } from "next/server";

import { listingById } from "@/lib/commerce";
import {
  PRESS_COOKIE_NAME,
  clearListingPress,
  listingPressCookieValue,
  mergeListingPressMaps,
  parseListingPress,
  readListingPress,
  tapeListingPress,
  writeListingPress,
} from "@/lib/listing-press";
import { listingPressPath } from "@/lib/paths";

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
  return listingPressPath(listingId || "missing");
}

function send(request: NextRequest, path: string, cookieValue?: string) {
  const response = NextResponse.redirect(new URL(path, originFrom(request)), 303);
  if (cookieValue !== undefined) {
    response.cookies.set({
      name: PRESS_COOKIE_NAME,
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
  const fallback = listingPressPath(listingId || "missing");
  const returnTo = safeReturnTo(
    String(form.get("returnTo") ?? fallback),
    listingId,
  );
  const current = mergeListingPressMaps(
    parseListingPress(request.cookies.get(PRESS_COOKIE_NAME)?.value),
    readListingPress(),
  );
  const listing = listingById(listingId);

  if (intent === "clear") {
    const result = clearListingPress(listing, current);
    if (!result.ok) {
      return send(request, fallback);
    }
    writeListingPress(result.map);
    return send(request, returnTo, listingPressCookieValue(result.map));
  }

  const result = tapeListingPress(listing, current, String(form.get("note") ?? ""));
  if (!result.ok) {
    if (result.reason === "empty" && listing) {
      const target = new URL(listingPressPath(listing.id), originFrom(request));
      target.searchParams.set("error", "empty");
      return NextResponse.redirect(target, 303);
    }
    return send(request, fallback);
  }

  writeListingPress(result.map);
  return send(request, returnTo, listingPressCookieValue(result.map));
}

export async function GET(request: NextRequest) {
  const listingId = request.nextUrl.searchParams.get("listingId")?.trim();
  const target = listingId ? listingPressPath(listingId) : "/explore";
  return NextResponse.redirect(new URL(target, originFrom(request)), 303);
}
