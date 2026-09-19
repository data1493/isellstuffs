import type { Metadata } from "next";
import { cookies } from "next/headers";

import { PickupCard } from "@/components/pickup/pickup-card";
import {
  PickupDigitalOnly,
  PickupEmpty,
} from "@/components/pickup/pickup-empty";
import { pickupPath } from "@/lib/paths";
import {
  CHECKOUT_COOKIE,
  pickupHasPhysicalLines,
  pickupSlipFromCookie,
} from "@/lib/pickup-slip";
import { shareMetadata } from "@/lib/seo";

export const metadata: Metadata = shareMetadata({
  title: "Pickup slip",
  description:
    "Walk-up hours for physical lines on the current paid slip. Driveway, porch, folding table — the mall does not ship.",
  path: pickupPath(),
  robots: { index: false, follow: false },
});

export default async function PickupIndexPage() {
  const jar = await cookies();
  const session = pickupSlipFromCookie(jar.get(CHECKOUT_COOKIE)?.value);

  if (!session) {
    return <PickupEmpty />;
  }

  if (!pickupHasPhysicalLines(session.listingIds)) {
    return (
      <PickupDigitalOnly slip={session.id} listingIds={session.listingIds} />
    );
  }

  return (
    <PickupCard
      slip={session.id}
      listingIds={session.listingIds}
      tender={session.tender}
    />
  );
}
