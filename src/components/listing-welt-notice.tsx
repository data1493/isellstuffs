import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  WELT_COOKIE_NAME,
  WELT_NOTICE_TITLE,
  WELT_PAIR_LINE,
  WELT_PEEL_LINE,
  WELT_STILL_LINE,
  WELT_TABLE_LINE,
  WELT_TOTE_LINE,
  isListingWeltOverlay,
  parseWeltListingIds,
} from "@/lib/listing-welt";
import { listingWeltPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-welt-them. Reads the cookie only. */
export async function ListingWeltNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseWeltListingIds(jar.get(WELT_COOKIE_NAME)?.value);

  if (!isListingWeltOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-welt-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={WELT_TABLE_LINE}
        title={WELT_NOTICE_TITLE}
        body={`${WELT_PEEL_LINE} ${WELT_PAIR_LINE} ${WELT_STILL_LINE} ${WELT_TOTE_LINE}`}
      >
        <Link
          href={listingWeltPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The welt card
        </Link>
      </MallNotice>
    </div>
  );
}
