import { NextResponse, type NextRequest } from "next/server";

import {
  addListingIdToSaved,
  parseSavedListingIds,
  removeListingIdFromSaved,
  SAVED_COOKIE_NAME,
} from "@/lib/saved";

function safeReturnTo(value: string) {
  if (value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return "/saved";
}

function writeSavedCookie(response: NextResponse, listingIds: string[]) {
  response.cookies.set({
    name: SAVED_COOKIE_NAME,
    value: JSON.stringify(listingIds),
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const listingId = String(form.get("listingId") ?? "");
  const returnTo = safeReturnTo(String(form.get("returnTo") ?? "/saved"));
  const intent = String(form.get("intent") ?? "add");
  const current = parseSavedListingIds(
    request.cookies.get(SAVED_COOKIE_NAME)?.value,
  );

  const referer = request.headers.get("referer");
  const origin =
    request.headers.get("origin") ??
    (referer ? new URL(referer).origin : request.nextUrl.origin);
  const response = NextResponse.redirect(new URL(returnTo, origin), 303);

  if (intent === "remove") {
    const result = removeListingIdFromSaved(listingId, current);
    writeSavedCookie(response, result.listingIds);
    return response;
  }

  const result = addListingIdToSaved(listingId, current);
  if (result.ok) {
    writeSavedCookie(response, result.listingIds);
  }
  return response;
}
