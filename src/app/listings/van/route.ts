import { NextResponse, type NextRequest } from "next/server";

import { listingById } from "@/lib/commerce";
import { listingVanPath } from "@/lib/paths";
import {
  VAN_COOKIE_NAME,
  clearListingVan,
  markListingVan,
  parseVanListingIds,
  readVanListingIds,
  vanCookieValue,
  writeVanListingIds,
} from "@/lib/van-restock";

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
  return listingVanPath(listingId || "missing");
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const listingId = String(form.get("listingId") ?? "").trim();
  const intent = String(form.get("intent") ?? "van").trim().toLowerCase();
  const returnTo = safeReturnTo(
    String(form.get("returnTo") ?? listingVanPath(listingId || "missing")),
    listingId,
  );
  const current = [
    ...new Set([
      ...parseVanListingIds(request.cookies.get(VAN_COOKIE_NAME)?.value),
      ...readVanListingIds(),
    ]),
  ];
  const listing = listingById(listingId);
  const result =
    intent === "table"
      ? clearListingVan(listing, current)
      : markListingVan(listing, current);

  const response = NextResponse.redirect(new URL(returnTo, originFrom(request)), 303);

  if (!result.ok) {
    return response;
  }

  writeVanListingIds(result.listingIds);
  response.cookies.set({
    name: VAN_COOKIE_NAME,
    value: vanCookieValue(result.listingIds),
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}

export async function GET(request: NextRequest) {
  const listingId = request.nextUrl.searchParams.get("listingId")?.trim();
  const target = listingId ? listingVanPath(listingId) : "/explore";
  return NextResponse.redirect(new URL(target, originFrom(request)), 303);
}
