import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  PARTS_COOKIE_NAME,
  PARTS_DEMO_LINE,
  PARTS_RUN_LINE,
  PARTS_STILL_LINE,
  PARTS_TABLE_LINE,
  PARTS_TOTE_LINE,
  isListingPartsOverlay,
  parsePartsListingIds,
} from "@/lib/listing-parts";
import { listingPartsPath } from "@/lib/paths";

/** PDP banner when this SKU is taped sold-for-parts. Does not change the tote. */
export async function ListingPartsNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parsePartsListingIds(jar.get(PARTS_COOKIE_NAME)?.value);

  if (!isListingPartsOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-parts-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Sold for parts"
        title={PARTS_TABLE_LINE}
        body={`${PARTS_RUN_LINE} ${PARTS_STILL_LINE} ${PARTS_TOTE_LINE} ${PARTS_DEMO_LINE}`}
      >
        <Link
          href={listingPartsPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The parts card
        </Link>
      </MallNotice>
    </div>
  );
}
