import { NextResponse, type NextRequest } from "next/server";

import {
  liveNoShowListing,
  markHandoffNoShow,
  NO_SHOW_COOKIE_NAME,
  noShowCookieValue,
  parseNoShowHandoffs,
  putNoShowWaiting,
  readNoShowHandoffs,
  soldIdsAfterNoShowIntent,
  uniqueNoShowHandoffs,
  writeNoShowHandoffs,
} from "@/lib/no-show-handoff";
import { sellNoShowPath } from "@/lib/paths";
import {
  parseSoldListingIds,
  readSoldListingIds,
  SOLD_COOKIE_NAME,
  soldCookieValue,
  writeSoldListingIds,
} from "@/lib/sold-overlay";
import {
  parseTakenHandoffs,
  readTakenHandoffs,
  TAKEN_COOKIE_NAME,
  uniqueTakenHandoffs,
} from "@/lib/taken-handoff";

function safeReturnTo(value: string) {
  if (value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return sellNoShowPath();
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const slipId = String(form.get("slipId") ?? "");
  const listingId = String(form.get("listingId") ?? "");
  const intent = String(form.get("intent") ?? "noshow") === "waiting"
    ? "waiting"
    : "noshow";
  const returnTo = safeReturnTo(String(form.get("returnTo") ?? sellNoShowPath()));
  const current = uniqueNoShowHandoffs([
    ...parseNoShowHandoffs(request.cookies.get(NO_SHOW_COOKIE_NAME)?.value),
    ...readNoShowHandoffs(),
  ]);
  const taken = uniqueTakenHandoffs([
    ...parseTakenHandoffs(request.cookies.get(TAKEN_COOKIE_NAME)?.value),
    ...readTakenHandoffs(),
  ]);
  const listing = liveNoShowListing(listingId);
  const result =
    intent === "waiting"
      ? putNoShowWaiting(listing, slipId, listingId, current)
      : markHandoffNoShow(listing, slipId, listingId, current, taken);

  const referer = request.headers.get("referer");
  const origin =
    request.headers.get("origin") ??
    (referer ? new URL(referer).origin : request.nextUrl.origin);
  const response = NextResponse.redirect(new URL(returnTo, origin), 303);

  if (result.ok) {
    writeNoShowHandoffs(result.handoffs);
    response.cookies.set({
      name: NO_SHOW_COOKIE_NAME,
      value: noShowCookieValue(result.handoffs),
      path: "/",
      sameSite: "lax",
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 30,
    });

    const soldCurrent = [
      ...new Set([
        ...parseSoldListingIds(request.cookies.get(SOLD_COOKIE_NAME)?.value),
        ...readSoldListingIds(),
      ]),
    ];
    const sold = soldIdsAfterNoShowIntent(
      listing,
      intent,
      soldCurrent,
      taken,
      slipId,
      listingId,
    );
    if (sold.ok) {
      writeSoldListingIds(sold.listingIds);
      response.cookies.set({
        name: SOLD_COOKIE_NAME,
        value: soldCookieValue(sold.listingIds),
        path: "/",
        sameSite: "lax",
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 30,
      });
    }
  }

  return response;
}
