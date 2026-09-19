import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  HEAT_CERAMIC_LINE,
  HEAT_COOKIE_NAME,
  HEAT_RIM_LINE,
  HEAT_STILL_LINE,
  HEAT_TABLE_LINE,
  HEAT_TOTE_LINE,
  isListingHeatOverlay,
  parseHeatListingIds,
} from "@/lib/listing-heat";
import { listingHeatPath } from "@/lib/paths";

/** PDP banner when this SKU cannot go in the microwave. Does not change the tote. */
export async function ListingHeatNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseHeatListingIds(jar.get(HEAT_COOKIE_NAME)?.value);

  if (!isListingHeatOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-heat-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Not for the microwave"
        title={HEAT_TABLE_LINE}
        body={`${HEAT_CERAMIC_LINE} ${HEAT_RIM_LINE} ${HEAT_STILL_LINE} ${HEAT_TOTE_LINE}`}
      >
        <Link
          href={listingHeatPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The heat card
        </Link>
      </MallNotice>
    </div>
  );
}
