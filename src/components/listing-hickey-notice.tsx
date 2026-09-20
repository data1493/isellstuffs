import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  HICKEY_COOKIE_NAME,
  HICKEY_NOTICE_TITLE,
  HICKEY_SHADE_LINE,
  HICKEY_STILL_LINE,
  HICKEY_TABLE_LINE,
  HICKEY_TOTE_LINE,
  HICKEY_WIGGLE_LINE,
  isListingHickeyOverlay,
  parseHickeyListingIds,
} from "@/lib/listing-hickey";
import { listingHickeyPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-hickey-it. Reads the cookie only. */
export async function ListingHickeyNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseHickeyListingIds(jar.get(HICKEY_COOKIE_NAME)?.value);

  if (!isListingHickeyOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-hickey-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={HICKEY_TABLE_LINE}
        title={HICKEY_NOTICE_TITLE}
        body={`${HICKEY_WIGGLE_LINE} ${HICKEY_SHADE_LINE} ${HICKEY_STILL_LINE} ${HICKEY_TOTE_LINE}`}
      >
        <Link
          href={listingHickeyPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The hickey card
        </Link>
      </MallNotice>
    </div>
  );
}
