import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  POGO_CART_LINE,
  POGO_COOKIE_NAME,
  POGO_NOTICE_TITLE,
  POGO_STILL_LINE,
  POGO_TABLE_LINE,
  POGO_TETRIS_LINE,
  POGO_TOTE_LINE,
  isListingPogoOverlay,
  parsePogoListingIds,
} from "@/lib/listing-pogo";
import { listingPogoPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-pogo-it. Reads the cookie only. */
export async function ListingPogoNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parsePogoListingIds(jar.get(POGO_COOKIE_NAME)?.value);

  if (!isListingPogoOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-pogo-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={POGO_TABLE_LINE}
        title={POGO_NOTICE_TITLE}
        body={`${POGO_CART_LINE} ${POGO_TETRIS_LINE} ${POGO_STILL_LINE} ${POGO_TOTE_LINE}`}
      >
        <Link
          href={listingPogoPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The pogo card
        </Link>
      </MallNotice>
    </div>
  );
}
