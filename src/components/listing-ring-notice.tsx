import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  RING_COOKIE_NAME,
  RING_FURNITURE_LINE,
  RING_HEAT_LINE,
  RING_STILL_LINE,
  RING_TABLE_LINE,
  RING_TOTE_LINE,
  isListingRingOverlay,
  parseRingListingIds,
} from "@/lib/listing-ring";
import { listingRingPath } from "@/lib/paths";

/** PDP banner when this SKU already has a water ring. Does not change the tote. */
export async function ListingRingNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseRingListingIds(jar.get(RING_COOKIE_NAME)?.value);

  if (!isListingRingOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-ring-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="The water ring stays"
        title={RING_TABLE_LINE}
        body={`${RING_FURNITURE_LINE} ${RING_HEAT_LINE} ${RING_STILL_LINE} ${RING_TOTE_LINE}`}
      >
        <Link
          href={listingRingPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The ring card
        </Link>
      </MallNotice>
    </div>
  );
}
