import { NextResponse, type NextRequest } from "next/server";

import {
  AD_BOOKINGS_COOKIE,
  createAdBooking,
  isAdSlotKind,
  isHubId,
  mergeAdBooking,
  nextWindowPackageByKind,
  parseAdBookings,
  serializeAdBookings,
} from "@/lib/ad-booking";
import { advertiseBookPath, advertiseReceiptPath } from "@/lib/paths";
import { sameOriginUrl } from "@/lib/same-origin";


function send(request: NextRequest, path: string, cookieValue?: string) {
  const response = NextResponse.redirect(sameOriginUrl(request, path), 303);
  if (cookieValue) {
    response.cookies.set({
      name: AD_BOOKINGS_COOKIE,
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
  const kind = String(form.get("kind") ?? "");
  const pack = nextWindowPackageByKind(kind);
  if (!pack || !isAdSlotKind(kind)) {
    return send(request, advertiseBookPath());
  }

  const stallName = String(form.get("stallName") ?? "");
  const hubRaw = String(form.get("hubId") ?? "");

  if (stallName.trim().length < 2) {
    return send(request, `${advertiseBookPath(pack.kind)}?error=name`);
  }
  if (pack.kind === "hub-takeover" && !isHubId(hubRaw)) {
    return send(request, `${advertiseBookPath(pack.kind)}?error=hub`);
  }

  try {
    const booking = createAdBooking({
      kind: pack.kind,
      stallName,
      ...(pack.kind === "hub-takeover" && isHubId(hubRaw)
        ? { hubId: hubRaw }
        : {}),
    });
    const next = mergeAdBooking(
      parseAdBookings(request.cookies.get(AD_BOOKINGS_COOKIE)?.value),
      booking,
    );
    return send(
      request,
      advertiseReceiptPath(booking.id),
      serializeAdBookings(next),
    );
  } catch {
    return send(request, `${advertiseBookPath(pack.kind)}?error=pay`);
  }
}

export async function GET(request: NextRequest) {
  return send(request, advertiseBookPath());
}
