import { NextResponse, type NextRequest } from "next/server";

import {
  HERE_COOKIE_NAME,
  hereCookieValue,
  liveHereListing,
  markHandoffHere,
  parseHereHandoffs,
  putHandoffWait,
  readHereHandoffs,
  uniqueHereHandoffs,
  writeHereHandoffs,
} from "@/lib/here-handoff";
import { pickupHerePath } from "@/lib/paths";
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
  return pickupHerePath();
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const slipId = String(form.get("slipId") ?? "");
  const listingId = String(form.get("listingId") ?? "");
  const intent = String(form.get("intent") ?? "here") === "wait" ? "wait" : "here";
  const returnTo = safeReturnTo(String(form.get("returnTo") ?? pickupHerePath()));
  const current = uniqueHereHandoffs([
    ...parseHereHandoffs(request.cookies.get(HERE_COOKIE_NAME)?.value),
    ...readHereHandoffs(),
  ]);
  const taken = uniqueTakenHandoffs([
    ...parseTakenHandoffs(request.cookies.get(TAKEN_COOKIE_NAME)?.value),
    ...readTakenHandoffs(),
  ]);
  const listing = liveHereListing(listingId);
  const result =
    intent === "wait"
      ? putHandoffWait(listing, slipId, listingId, current, taken)
      : markHandoffHere(listing, slipId, listingId, current, taken);

  const referer = request.headers.get("referer");
  const origin =
    request.headers.get("origin") ??
    (referer ? new URL(referer).origin : request.nextUrl.origin);

  if (!result.ok) {
    return NextResponse.redirect(new URL(pickupHerePath(), origin), 303);
  }

  writeHereHandoffs(result.handoffs);
  const response = NextResponse.redirect(new URL(returnTo, origin), 303);
  response.cookies.set({
    name: HERE_COOKIE_NAME,
    value: hereCookieValue(result.handoffs),
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
