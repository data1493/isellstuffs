import type { Metadata } from "next";
import { cookies } from "next/headers";

import { AdFlyerView } from "@/components/ads/ad-flyer-view";
import { AD_BOOKINGS_COOKIE } from "@/lib/ad-booking";
import {
  decodeFlyerBookingId,
  flyerFromCookie,
} from "@/lib/ad-flyer";
import { advertiseFlyerPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ booking: string }>;
}): Promise<Metadata> {
  const { booking } = await params;
  const bookingId = decodeFlyerBookingId(booking);
  return shareMetadata({
    title: "Ad flyer",
    description:
      "Take-home souvenir for a paid next-weekend corner. Stall, package, window, Paid stamp. You bought light, not a rewrite.",
    path: advertiseFlyerPath(bookingId),
    robots: { index: false, follow: false },
  });
}

export default async function AdvertiseFlyerPage({
  params,
}: {
  params: Promise<{ booking: string }>;
}) {
  const { booking: raw } = await params;
  const bookingId = decodeFlyerBookingId(raw);
  const jar = await cookies();
  const seed = flyerFromCookie(jar.get(AD_BOOKINGS_COOKIE)?.value, bookingId);

  return <AdFlyerView bookingId={bookingId} seed={seed} />;
}
