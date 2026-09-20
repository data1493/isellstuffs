import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  MASK_BOARD_LINE,
  MASK_COOKIE_NAME,
  MASK_FUSED_LINE,
  MASK_NOTICE_TITLE,
  MASK_STILL_LINE,
  MASK_TABLE_LINE,
  MASK_TOTE_LINE,
  isListingMaskOverlay,
  parseMaskListingIds,
} from "@/lib/listing-mask";
import { listingMaskPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-mask-it. Reads the cookie only. */
export async function ListingMaskNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseMaskListingIds(jar.get(MASK_COOKIE_NAME)?.value);

  if (!isListingMaskOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-mask-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={MASK_TABLE_LINE}
        title={MASK_NOTICE_TITLE}
        body={`${MASK_BOARD_LINE} ${MASK_FUSED_LINE} ${MASK_STILL_LINE} ${MASK_TOTE_LINE}`}
      >
        <Link
          href={listingMaskPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The mask card
        </Link>
      </MallNotice>
    </div>
  );
}
