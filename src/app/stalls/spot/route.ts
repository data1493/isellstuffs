import { NextResponse, type NextRequest } from "next/server";

import {
  MOVED_SPOT_COOKIE_NAME,
  clearMovedSpot,
  parseMovedSpot,
  resolveMovedSpotStall,
  serializeMovedSpot,
  tapeMovedSpot,
} from "@/lib/moved-spot";
import { stallSpotPath } from "@/lib/paths";
import { sameOriginUrl } from "@/lib/same-origin";


function safeReturnTo(value: string, fallback: string) {
  if (value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return fallback;
}

function send(request: NextRequest, path: string, cookieValue?: string) {
  const response = NextResponse.redirect(sameOriginUrl(request, path), 303);
  if (cookieValue !== undefined) {
    response.cookies.set({
      name: MOVED_SPOT_COOKIE_NAME,
      value: cookieValue,
      path: "/",
      sameSite: "lax",
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return response;
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const stallKey = String(form.get("stallId") ?? "");
  const intent = String(form.get("intent") ?? "tape");
  const stall = resolveMovedSpotStall(stallKey);
  const fallback = stall
    ? stallSpotPath(stall.slug)
    : stallSpotPath(stallKey.trim() || "missing");
  const returnTo = safeReturnTo(
    String(form.get("returnTo") ?? fallback),
    fallback,
  );
  const existing = parseMovedSpot(
    request.cookies.get(MOVED_SPOT_COOKIE_NAME)?.value,
  );

  if (!stall) {
    return send(request, fallback);
  }

  if (intent === "clear") {
    const result = clearMovedSpot(stall, existing);
    return send(request, returnTo, serializeMovedSpot(result.map));
  }

  const result = tapeMovedSpot(stall, existing, String(form.get("note") ?? ""));
  if (!result.ok) {
    if (result.reason === "empty") {
      const target = sameOriginUrl(request, stallSpotPath(stall.slug));
      target.searchParams.set("error", "empty");
      return NextResponse.redirect(target, 303);
    }
    return send(request, stallSpotPath(stall.slug));
  }

  return send(request, returnTo, serializeMovedSpot(result.map));
}

export async function GET(request: NextRequest) {
  return NextResponse.redirect(
    sameOriginUrl(request, stallSpotPath("folding-table-tuesday")),
    303,
  );
}
