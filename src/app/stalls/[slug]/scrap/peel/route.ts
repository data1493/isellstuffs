import { NextResponse, type NextRequest } from "next/server";

import { stallScrapPath } from "@/lib/paths";
import {
  parseStallScraps,
  peelStallScrap,
  serializeStallScraps,
  STALL_SCRAP_COOKIE_NAME,
} from "@/lib/stall-scrap";
import { sameOriginUrl } from "@/lib/same-origin";


export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const form = await request.formData();
  const scrapId = String(form.get("scrapId") ?? "");
  const existing = parseStallScraps(
    request.cookies.get(STALL_SCRAP_COOKIE_NAME)?.value,
  );
  const scraps = peelStallScrap(existing, scrapId);

  const response = NextResponse.redirect(
    sameOriginUrl(request, stallScrapPath(slug)),
    303,
  );
  response.cookies.set({
    name: STALL_SCRAP_COOKIE_NAME,
    value: serializeStallScraps(scraps),
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  return NextResponse.redirect(
    sameOriginUrl(request, stallScrapPath(slug)),
    303,
  );
}
