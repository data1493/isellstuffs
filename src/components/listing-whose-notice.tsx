import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  WHOSE_CHIP_LINE,
  WHOSE_COOKIE_NAME,
  WHOSE_MATCH_LINE,
  WHOSE_NOTICE_TITLE,
  WHOSE_STILL_LINE,
  WHOSE_TABLE_LINE,
  WHOSE_TOTE_LINE,
  isListingWhoseOverlay,
  parseWhoseListingIds,
} from "@/lib/listing-whose";
import { listingWhosePath } from "@/lib/paths";

/** PDP banner when this SKU is taped I-will-not-say-whose. Does not change the tote. */
export async function ListingWhoseNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseWhoseListingIds(jar.get(WHOSE_COOKIE_NAME)?.value);

  if (!isListingWhoseOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-whose-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={WHOSE_TABLE_LINE}
        title={WHOSE_NOTICE_TITLE}
        body={`${WHOSE_CHIP_LINE} ${WHOSE_MATCH_LINE} ${WHOSE_STILL_LINE} ${WHOSE_TOTE_LINE}`}
      >
        <Link
          href={listingWhosePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The whose card
        </Link>
      </MallNotice>
    </div>
  );
}
