import { NextResponse, type NextRequest } from "next/server";

import { listingById } from "@/lib/commerce";
import {
  FIRM_COOKIE_NAME,
  clearListingFirm,
  firmCookieValue,
  markListingFirm,
  parseFirmListingIds,
  readFirmListingIds,
  writeFirmListingIds,
} from "@/lib/firm-price";
import { listingFirmPath } from "@/lib/paths";

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
  return listingFirmPath(listingId || "missing");
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const form = await request.formData();
  const listingId = String(form.get("listingId") ?? id).trim() || id;
  const intent = String(form.get("intent") ?? "firm").trim().toLowerCase();
  const returnTo = safeReturnTo(
    String(form.get("returnTo") ?? listingFirmPath(listingId || "missing")),
    listingId,
  );
  const current = [
    ...new Set([
      ...parseFirmListingIds(request.cookies.get(FIRM_COOKIE_NAME)?.value),
      ...readFirmListingIds(),
    ]),
  ];
  const listing = listingById(listingId);
  const result =
    intent === "open"
      ? clearListingFirm(listing, current)
      : markListingFirm(listing, current);

  const response = NextResponse.redirect(new URL(returnTo, originFrom(request)), 303);

  if (!result.ok) {
    return response;
  }

  writeFirmListingIds(result.listingIds);
  response.cookies.set({
    name: FIRM_COOKIE_NAME,
    value: firmCookieValue(result.listingIds),
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return NextResponse.redirect(new URL(listingFirmPath(id), originFrom(request)), 303);
}
