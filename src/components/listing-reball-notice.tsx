import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  REBALL_COOKIE_NAME,
  REBALL_CRACK_LINE,
  REBALL_NOTICE_TITLE,
  REBALL_STILL_LINE,
  REBALL_TABLE_LINE,
  REBALL_TETRIS_LINE,
  REBALL_TOTE_LINE,
  isListingReballOverlay,
  parseReballListingIds,
} from "@/lib/listing-reball";
import { listingReballPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-reball-it. Reads the cookie only. */
export async function ListingReballNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseReballListingIds(jar.get(REBALL_COOKIE_NAME)?.value);

  if (!isListingReballOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-reball-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={REBALL_TABLE_LINE}
        title={REBALL_NOTICE_TITLE}
        body={`${REBALL_CRACK_LINE} ${REBALL_TETRIS_LINE} ${REBALL_STILL_LINE} ${REBALL_TOTE_LINE}`}
      >
        <Link
          href={listingReballPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The reball card
        </Link>
      </MallNotice>
    </div>
  );
}
