import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  ISRC_COOKIE_NAME,
  ISRC_JEWEL_LINE,
  ISRC_NOTICE_TITLE,
  ISRC_SHARPIE_LINE,
  ISRC_STILL_LINE,
  ISRC_TABLE_LINE,
  ISRC_TOTE_LINE,
  isListingIsrcOverlay,
  parseIsrcListingIds,
} from "@/lib/listing-isrc";
import { listingIsrcPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-isrc-it. Reads the cookie only. */
export async function ListingIsrcNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseIsrcListingIds(jar.get(ISRC_COOKIE_NAME)?.value);

  if (!isListingIsrcOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-isrc-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={ISRC_TABLE_LINE}
        title={ISRC_NOTICE_TITLE}
        body={`${ISRC_SHARPIE_LINE} ${ISRC_JEWEL_LINE} ${ISRC_STILL_LINE} ${ISRC_TOTE_LINE}`}
      >
        <Link
          href={listingIsrcPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The isrc card
        </Link>
      </MallNotice>
    </div>
  );
}
