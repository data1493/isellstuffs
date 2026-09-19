import { NextResponse, type NextRequest } from "next/server";

import { stallById } from "@/lib/commerce";
import {
  PACKED_COOKIE_NAME,
  packStall,
  packedCookieValue,
  parsePackedStallIds,
  readPackedStallIds,
  unpackStall,
  writePackedStallIds,
} from "@/lib/packed-stall";
import { sellDeskPath } from "@/lib/paths";

function safeReturnTo(value: string) {
  if (value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return sellDeskPath();
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const stallId = String(form.get("stallId") ?? "");
  const intent = String(form.get("intent") ?? "pack");
  const returnTo = safeReturnTo(String(form.get("returnTo") ?? sellDeskPath()));
  const current = [
    ...new Set([
      ...parsePackedStallIds(request.cookies.get(PACKED_COOKIE_NAME)?.value),
      ...readPackedStallIds(),
    ]),
  ];
  const stall = stallById(stallId);
  const result =
    intent === "open" ? unpackStall(stall, current) : packStall(stall, current);

  const referer = request.headers.get("referer");
  const origin =
    request.headers.get("origin") ??
    (referer ? new URL(referer).origin : request.nextUrl.origin);
  const response = NextResponse.redirect(new URL(returnTo, origin), 303);

  if (result.ok) {
    writePackedStallIds(result.stallIds);
    response.cookies.set({
      name: PACKED_COOKIE_NAME,
      value: packedCookieValue(result.stallIds),
      path: "/",
      sameSite: "lax",
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return response;
}
