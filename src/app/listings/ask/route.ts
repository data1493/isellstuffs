import { NextResponse, type NextRequest } from "next/server";

import {
  ASK_COOKIE_NAME,
  askCookieValue,
  clearListingAsk,
  markListingAsk,
  parseAskListingIds,
  readAskListingIds,
  writeAskListingIds,
} from "@/lib/ask-first";
import { listingById } from "@/lib/commerce";
import { listingAskPath } from "@/lib/paths";

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
  return listingAskPath(listingId || "missing");
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const listingId = String(form.get("listingId") ?? "").trim();
  const intent = String(form.get("intent") ?? "ask").trim().toLowerCase();
  const returnTo = safeReturnTo(
    String(form.get("returnTo") ?? listingAskPath(listingId || "missing")),
    listingId,
  );
  const current = [
    ...new Set([
      ...parseAskListingIds(request.cookies.get(ASK_COOKIE_NAME)?.value),
      ...readAskListingIds(),
    ]),
  ];
  const listing = listingById(listingId);
  const result =
    intent === "flip"
      ? clearListingAsk(listing, current)
      : markListingAsk(listing, current);

  const response = NextResponse.redirect(new URL(returnTo, originFrom(request)), 303);

  if (!result.ok) {
    return response;
  }

  writeAskListingIds(result.listingIds);
  response.cookies.set({
    name: ASK_COOKIE_NAME,
    value: askCookieValue(result.listingIds),
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}

export async function GET(request: NextRequest) {
  const listingId = request.nextUrl.searchParams.get("listingId")?.trim();
  const target = listingId ? listingAskPath(listingId) : "/explore";
  return NextResponse.redirect(new URL(target, originFrom(request)), 303);
}
