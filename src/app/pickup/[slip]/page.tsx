import type { Metadata } from "next";
import { cookies } from "next/headers";

import { PickupSlipView } from "@/components/pickup/pickup-views";
import { pickupSlipPath } from "@/lib/paths";
import { CHECKOUT_COOKIE, pickupSlipFromCookie } from "@/lib/pickup-slip";
import { shareMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slip: string }>;
}): Promise<Metadata> {
  const { slip } = await params;
  return shareMetadata({
    title: "Pickup slip",
    description:
      "Walk-up hours for physical lines on this paid slip. Driveway, porch, folding table — the mall does not ship.",
    path: pickupSlipPath(slip),
    robots: { index: false, follow: false },
  });
}

export default async function PickupSlipPage({
  params,
}: {
  params: Promise<{ slip: string }>;
}) {
  const { slip: rawSlip } = await params;
  const slip = decodeURIComponent(rawSlip);
  const jar = await cookies();
  const seed = pickupSlipFromCookie(jar.get(CHECKOUT_COOKIE)?.value, slip);

  return <PickupSlipView slip={slip} seed={seed} />;
}
