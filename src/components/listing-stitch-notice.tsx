import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  STITCH_COOKIE_NAME,
  STITCH_NOTICE_TITLE,
  STITCH_PAIR_LINE,
  STITCH_PEEL_LINE,
  STITCH_STILL_LINE,
  STITCH_TABLE_LINE,
  STITCH_TOTE_LINE,
  isListingStitchOverlay,
  parseStitchListingIds,
} from "@/lib/listing-stitch";
import { listingStitchPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-stitch-them. Reads the cookie only. */
export async function ListingStitchNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseStitchListingIds(jar.get(STITCH_COOKIE_NAME)?.value);

  if (!isListingStitchOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-stitch-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={STITCH_TABLE_LINE}
        title={STITCH_NOTICE_TITLE}
        body={`${STITCH_PAIR_LINE} ${STITCH_PEEL_LINE} ${STITCH_STILL_LINE} ${STITCH_TOTE_LINE}`}
      >
        <Link
          href={listingStitchPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The stitch card
        </Link>
      </MallNotice>
    </div>
  );
}
