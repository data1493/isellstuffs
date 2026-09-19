import { NextResponse, type NextRequest } from "next/server";

import { listingById } from "@/lib/commerce";
import { sellDeskPath } from "@/lib/paths";
import { sellerListingById } from "@/lib/seller-overlay";
import {
  TESTED_KINDA_COOKIE_NAME,
  dropTestedKinda,
  parseTestedKindaIds,
  pinTestedKinda,
  readTestedKindaIds,
  testedKindaCookieValue,
  writeTestedKindaIds,
} from "@/lib/tested-kinda-pin";

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
  const intent = String(form.get("intent") ?? "pin");
  const returnTo = safeReturnTo(String(form.get("returnTo") ?? sellDeskPath()));
  const current = [
    ...new Set([
      ...parseTestedKindaIds(
        request.cookies.get(TESTED_KINDA_COOKIE_NAME)?.value,
      ),
      ...readTestedKindaIds(),
    ]),
  ];
  const listing = liveListing(listingId);
  const result =
    intent === "drop"
      ? dropTestedKinda(listing, current)
      : pinTestedKinda(listing, current);

  const referer = request.headers.get("referer");
  const origin =
    request.headers.get("origin") ??
    (referer ? new URL(referer).origin : request.nextUrl.origin);
  const response = NextResponse.redirect(new URL(returnTo, origin), 303);

  if (result.ok) {
    writeTestedKindaIds(result.listingIds);
    response.cookies.set({
      name: TESTED_KINDA_COOKIE_NAME,
      value: testedKindaCookieValue(result.listingIds),
      path: "/",
      sameSite: "lax",
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return response;
}
