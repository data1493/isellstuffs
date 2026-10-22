import { NextResponse, type NextRequest } from "next/server";

import {
  EARLY_FOLD_COOKIE_NAME,
  clearEarlyFold,
  parseEarlyFold,
  resolveEarlyFoldStall,
  serializeEarlyFold,
  tapeEarlyFold,
} from "@/lib/early-fold";
import { stallFoldPath } from "@/lib/paths";
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
      name: EARLY_FOLD_COOKIE_NAME,
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
  const stall = resolveEarlyFoldStall(stallKey);
  const fallback = stall
    ? stallFoldPath(stall.slug)
    : stallFoldPath(stallKey.trim() || "missing");
  const returnTo = safeReturnTo(
    String(form.get("returnTo") ?? fallback),
    fallback,
  );
  const existing = parseEarlyFold(
    request.cookies.get(EARLY_FOLD_COOKIE_NAME)?.value,
  );

  if (!stall) {
    return send(request, fallback);
  }

  if (intent === "clear") {
    const result = clearEarlyFold(stall, existing);
    return send(request, returnTo, serializeEarlyFold(result.map));
  }

  const result = tapeEarlyFold(stall, existing, String(form.get("note") ?? ""));
  if (!result.ok) {
    if (result.reason === "empty") {
      const target = sameOriginUrl(request, stallFoldPath(stall.slug));
      target.searchParams.set("error", "empty");
      return NextResponse.redirect(target, 303);
    }
    return send(request, stallFoldPath(stall.slug));
  }

  return send(request, returnTo, serializeEarlyFold(result.map));
}

export async function GET(request: NextRequest) {
  return NextResponse.redirect(
    sameOriginUrl(request, stallFoldPath("folding-table-tuesday")),
    303,
  );
}
