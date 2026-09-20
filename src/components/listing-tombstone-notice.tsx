import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  TOMBSTONE_COOKIE_NAME,
  TOMBSTONE_CRACK_LINE,
  TOMBSTONE_NOTICE_TITLE,
  TOMBSTONE_STILL_LINE,
  TOMBSTONE_TABLE_LINE,
  TOMBSTONE_TETRIS_LINE,
  TOMBSTONE_TOTE_LINE,
  isListingTombstoneOverlay,
  parseTombstoneListingIds,
} from "@/lib/listing-tombstone";
import { listingTombstonePath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-tombstone-it. Reads the cookie only. */
export async function ListingTombstoneNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseTombstoneListingIds(jar.get(TOMBSTONE_COOKIE_NAME)?.value);

  if (!isListingTombstoneOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-tombstone-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={TOMBSTONE_TABLE_LINE}
        title={TOMBSTONE_NOTICE_TITLE}
        body={`${TOMBSTONE_CRACK_LINE} ${TOMBSTONE_TETRIS_LINE} ${TOMBSTONE_STILL_LINE} ${TOMBSTONE_TOTE_LINE}`}
      >
        <Link
          href={listingTombstonePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The tombstone card
        </Link>
      </MallNotice>
    </div>
  );
}
