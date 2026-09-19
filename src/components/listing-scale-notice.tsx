import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  SCALE_CARDS_LINE,
  SCALE_COOKIE_NAME,
  SCALE_NOTICE_TITLE,
  SCALE_STILL_LINE,
  SCALE_TABLE_LINE,
  SCALE_TOTE_LINE,
  SCALE_VIBE_LINE,
  isListingScaleOverlay,
  parseScaleListingIds,
} from "@/lib/listing-scale";
import { listingScalePath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-scale-them. Reads the cookie only. */
export async function ListingScaleNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseScaleListingIds(jar.get(SCALE_COOKIE_NAME)?.value);

  if (!isListingScaleOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-scale-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={SCALE_TABLE_LINE}
        title={SCALE_NOTICE_TITLE}
        body={`${SCALE_VIBE_LINE} ${SCALE_CARDS_LINE} ${SCALE_STILL_LINE} ${SCALE_TOTE_LINE}`}
      >
        <Link
          href={listingScalePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The scale card
        </Link>
      </MallNotice>
    </div>
  );
}
