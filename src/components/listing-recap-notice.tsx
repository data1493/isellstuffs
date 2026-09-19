import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  RECAP_COOKIE_NAME,
  RECAP_LUCK_LINE,
  RECAP_NOTICE_TITLE,
  RECAP_STILL_LINE,
  RECAP_TABLE_LINE,
  RECAP_TETRIS_LINE,
  RECAP_TOTE_LINE,
  isListingRecapOverlay,
  parseRecapListingIds,
} from "@/lib/listing-recap";
import { listingRecapPath } from "@/lib/paths";

/** PDP banner when this SKU is taped I-will-not-recap. Does not change the tote. */
export async function ListingRecapNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseRecapListingIds(jar.get(RECAP_COOKIE_NAME)?.value);

  if (!isListingRecapOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-recap-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={RECAP_TABLE_LINE}
        title={RECAP_NOTICE_TITLE}
        body={`${RECAP_LUCK_LINE} ${RECAP_TETRIS_LINE} ${RECAP_STILL_LINE} ${RECAP_TOTE_LINE}`}
      >
        <Link
          href={listingRecapPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The recap card
        </Link>
      </MallNotice>
    </div>
  );
}
