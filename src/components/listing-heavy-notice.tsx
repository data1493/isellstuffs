import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  HEAVY_COOKIE_NAME,
  HEAVY_LIFT_LINE,
  HEAVY_STILL_LINE,
  HEAVY_TABLE_LINE,
  HEAVY_TOTE_LINE,
  isListingHeavyOverlay,
  parseHeavyListingIds,
} from "@/lib/listing-heavy";
import { listingHeavyPath } from "@/lib/paths";

/** PDP banner when this SKU needs two people. Does not change the tote. */
export async function ListingHeavyNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseHeavyListingIds(jar.get(HEAVY_COOKIE_NAME)?.value);

  if (!isListingHeavyOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-heavy-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Two people"
        title={HEAVY_TABLE_LINE}
        body={`${HEAVY_STILL_LINE} ${HEAVY_TOTE_LINE} ${HEAVY_LIFT_LINE}`}
      >
        <Link
          href={listingHeavyPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The lift card
        </Link>
      </MallNotice>
    </div>
  );
}
