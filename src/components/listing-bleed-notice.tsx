import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  BLEED_COOKIE_NAME,
  BLEED_NOTICE_TITLE,
  BLEED_PAGE_LINE,
  BLEED_STILL_LINE,
  BLEED_TABLE_LINE,
  BLEED_TOTE_LINE,
  BLEED_WRONG_LINE,
  isListingBleedOverlay,
  parseBleedListingIds,
} from "@/lib/listing-bleed";
import { listingBleedPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-bleed-it. Reads the cookie only. */
export async function ListingBleedNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseBleedListingIds(jar.get(BLEED_COOKIE_NAME)?.value);

  if (!isListingBleedOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-bleed-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={BLEED_TABLE_LINE}
        title={BLEED_NOTICE_TITLE}
        body={`${BLEED_PAGE_LINE} ${BLEED_WRONG_LINE} ${BLEED_STILL_LINE} ${BLEED_TOTE_LINE}`}
      >
        <Link
          href={listingBleedPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The bleed card
        </Link>
      </MallNotice>
    </div>
  );
}
