import { NextResponse, type NextRequest } from "next/server";

import {
  BACK_SOON_COOKIE_NAME,
  clearBackSoon,
  parseBackSoon,
  resolveBackSoonStall,
  serializeBackSoon,
  tapeBackSoon,
} from "@/lib/back-soon";
import { stallBackPath } from "@/lib/paths";
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
      name: BACK_SOON_COOKIE_NAME,
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
  const stall = resolveBackSoonStall(stallKey);
  const fallback = stall
    ? stallBackPath(stall.slug)
    : stallBackPath(stallKey.trim() || "missing");
  const returnTo = safeReturnTo(
    String(form.get("returnTo") ?? fallback),
    fallback,
  );
  const existing = parseBackSoon(
    request.cookies.get(BACK_SOON_COOKIE_NAME)?.value,
  );

  if (!stall) {
    return send(request, fallback);
  }

  if (intent === "clear") {
    const result = clearBackSoon(stall, existing);
    return send(request, returnTo, serializeBackSoon(result.map));
  }

  const result = tapeBackSoon(stall, existing, String(form.get("note") ?? ""));
  if (!result.ok) {
    if (result.reason === "empty") {
      const target = sameOriginUrl(request, stallBackPath(stall.slug));
      target.searchParams.set("error", "empty");
      return NextResponse.redirect(target, 303);
    }
    return send(request, stallBackPath(stall.slug));
  }

  return send(request, returnTo, serializeBackSoon(result.map));
}

export async function GET(request: NextRequest) {
  return NextResponse.redirect(
    sameOriginUrl(request, stallBackPath("folding-table-tuesday")),
    303,
  );
}
