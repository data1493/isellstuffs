import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  MANUAL_BOOK_LINE,
  MANUAL_BOX_LINE,
  MANUAL_COOKIE_NAME,
  MANUAL_FIGURE_LINE,
  MANUAL_PAPER_LINE,
  MANUAL_STILL_LINE,
  MANUAL_TABLE_LINE,
  MANUAL_TOTE_LINE,
  isListingManualOverlay,
  parseManualListingIds,
} from "@/lib/listing-manual";
import { listingManualPath } from "@/lib/paths";

/** PDP banner when this SKU is taped no-manual. Does not change the tote. */
export async function ListingManualNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseManualListingIds(jar.get(MANUAL_COOKIE_NAME)?.value);

  if (!isListingManualOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-manual-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="There is no manual"
        title={MANUAL_TABLE_LINE}
        body={`${MANUAL_PAPER_LINE} ${MANUAL_FIGURE_LINE} ${MANUAL_BOOK_LINE} ${MANUAL_BOX_LINE} ${MANUAL_STILL_LINE} ${MANUAL_TOTE_LINE}`}
      >
        <Link
          href={listingManualPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The manual card
        </Link>
      </MallNotice>
    </div>
  );
}
