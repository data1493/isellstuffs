import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  BILLBOARD_COOKIE_NAME,
  BILLBOARD_CRACK_LINE,
  BILLBOARD_NOTICE_TITLE,
  BILLBOARD_STILL_LINE,
  BILLBOARD_TABLE_LINE,
  BILLBOARD_TETRIS_LINE,
  BILLBOARD_TOTE_LINE,
  isListingBillboardOverlay,
  parseBillboardListingIds,
} from "@/lib/listing-billboard";
import { listingBillboardPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-billboard-it. Reads the cookie only. */
export async function ListingBillboardNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseBillboardListingIds(jar.get(BILLBOARD_COOKIE_NAME)?.value);

  if (!isListingBillboardOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-billboard-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={BILLBOARD_TABLE_LINE}
        title={BILLBOARD_NOTICE_TITLE}
        body={`${BILLBOARD_CRACK_LINE} ${BILLBOARD_TETRIS_LINE} ${BILLBOARD_STILL_LINE} ${BILLBOARD_TOTE_LINE}`}
      >
        <Link
          href={listingBillboardPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The billboard card
        </Link>
      </MallNotice>
    </div>
  );
}
