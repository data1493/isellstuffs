import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  CHIP_COOKIE_NAME,
  CHIP_HEAT_LINE,
  CHIP_RIM_LINE,
  CHIP_STILL_LINE,
  CHIP_TABLE_LINE,
  CHIP_TOTE_LINE,
  isListingChipOverlay,
  parseChipListingIds,
} from "@/lib/listing-chip";
import { listingChipPath } from "@/lib/paths";

/** PDP banner when this SKU is taped chip-stays. Does not change the tote. */
export async function ListingChipNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseChipListingIds(jar.get(CHIP_COOKIE_NAME)?.value);

  if (!isListingChipOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-chip-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="The chip stays"
        title={CHIP_TABLE_LINE}
        body={`${CHIP_RIM_LINE} ${CHIP_STILL_LINE} ${CHIP_TOTE_LINE} ${CHIP_HEAT_LINE}`}
      >
        <Link
          href={listingChipPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The chip card
        </Link>
      </MallNotice>
    </div>
  );
}
