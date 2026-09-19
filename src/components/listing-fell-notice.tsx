import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  FELL_COOKIE_NAME,
  FELL_MINT_LINE,
  FELL_NOTICE_TITLE,
  FELL_STILL_LINE,
  FELL_TABLE_LINE,
  FELL_TOTE_LINE,
  FELL_WORN_LINE,
  isListingFellOverlay,
  parseFellListingIds,
} from "@/lib/listing-fell";
import { listingFellPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-fell-it. Reads the cookie only. */
export async function ListingFellNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseFellListingIds(jar.get(FELL_COOKIE_NAME)?.value);

  if (!isListingFellOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-fell-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={FELL_TABLE_LINE}
        title={FELL_NOTICE_TITLE}
        body={`${FELL_WORN_LINE} ${FELL_MINT_LINE} ${FELL_STILL_LINE} ${FELL_TOTE_LINE}`}
      >
        <Link
          href={listingFellPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The fell card
        </Link>
      </MallNotice>
    </div>
  );
}
