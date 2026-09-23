import { NextResponse, type NextRequest } from "next/server";

import { listingById } from "@/lib/commerce";
import {
  FILE_GONE_COOKIE_NAME,
  fileGoneCookieValue,
  markListingFileGone,
  parseFileGoneListingIds,
  readFileGoneListingIds,
  restockFileListing,
  writeFileGoneListingIds,
} from "@/lib/file-gone-overlay";
import { sellDeskPath } from "@/lib/paths";
import { sellerListingById } from "@/lib/seller-overlay";

function safeReturnTo(value: string) {
  if (value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return sellDeskPath();
}

function liveListing(listingId: string) {
  return listingById(listingId) ?? sellerListingById(listingId);
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const listingId = String(form.get("listingId") ?? "");
  const intent = String(form.get("intent") ?? "gone");
  const returnTo = safeReturnTo(String(form.get("returnTo") ?? sellDeskPath()));
  const current = [
    ...new Set([
      ...parseFileGoneListingIds(
        request.cookies.get(FILE_GONE_COOKIE_NAME)?.value,
      ),
      ...readFileGoneListingIds(),
    ]),
  ];
  const listing = liveListing(listingId);
  const result =
    intent === "open"
      ? restockFileListing(listing, current)
      : markListingFileGone(listing, current);

  const referer = request.headers.get("referer");
  const origin =
    request.headers.get("origin") ??
    (referer ? new URL(referer).origin : request.nextUrl.origin);
  const response = NextResponse.redirect(new URL(returnTo, origin), 303);

  if (result.ok) {
    writeFileGoneListingIds(result.listingIds);
    response.cookies.set({
      name: FILE_GONE_COOKIE_NAME,
      value: fileGoneCookieValue(result.listingIds),
      path: "/",
      sameSite: "lax",
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return response;
}
