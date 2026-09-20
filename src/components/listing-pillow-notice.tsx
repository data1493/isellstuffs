import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  PILLOW_COOKIE_NAME,
  PILLOW_CRACK_LINE,
  PILLOW_NOTICE_TITLE,
  PILLOW_STILL_LINE,
  PILLOW_TABLE_LINE,
  PILLOW_TETRIS_LINE,
  PILLOW_TOTE_LINE,
  isListingPillowOverlay,
  parsePillowListingIds,
} from "@/lib/listing-pillow";
import { listingPillowPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-pillow-it. Reads the cookie only. */
export async function ListingPillowNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parsePillowListingIds(jar.get(PILLOW_COOKIE_NAME)?.value);

  if (!isListingPillowOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-pillow-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={PILLOW_TABLE_LINE}
        title={PILLOW_NOTICE_TITLE}
        body={`${PILLOW_CRACK_LINE} ${PILLOW_TETRIS_LINE} ${PILLOW_STILL_LINE} ${PILLOW_TOTE_LINE}`}
      >
        <Link
          href={listingPillowPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The pillow card
        </Link>
      </MallNotice>
    </div>
  );
}
