import { NextResponse, type NextRequest } from "next/server";

import { sellTakenPath } from "@/lib/paths";
import {
  liveTakeListing,
  markHandoffTaken,
  parseTakenHandoffs,
  putHandoffWaiting,
  readTakenHandoffs,
  TAKEN_COOKIE_NAME,
  takenCookieValue,
  uniqueTakenHandoffs,
  writeTakenHandoffs,
} from "@/lib/taken-handoff";

function safeReturnTo(value: string) {
  if (value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return sellTakenPath();
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const slipId = String(form.get("slipId") ?? "");
  const listingId = String(form.get("listingId") ?? "");
  const intent = String(form.get("intent") ?? "taken");
  const returnTo = safeReturnTo(String(form.get("returnTo") ?? sellTakenPath()));
  const current = uniqueTakenHandoffs([
    ...parseTakenHandoffs(request.cookies.get(TAKEN_COOKIE_NAME)?.value),
    ...readTakenHandoffs(),
  ]);
  const listing = liveTakeListing(listingId);
  const result =
    intent === "waiting"
      ? putHandoffWaiting(listing, slipId, listingId, current)
      : markHandoffTaken(listing, slipId, listingId, current);

  const referer = request.headers.get("referer");
  const origin =
    request.headers.get("origin") ??
    (referer ? new URL(referer).origin : request.nextUrl.origin);
  const response = NextResponse.redirect(new URL(returnTo, origin), 303);

  if (result.ok) {
    writeTakenHandoffs(result.handoffs);
    response.cookies.set({
      name: TAKEN_COOKIE_NAME,
      value: takenCookieValue(result.handoffs),
      path: "/",
      sameSite: "lax",
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return response;
}
