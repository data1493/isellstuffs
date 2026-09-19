import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  CINCH_COOKIE_NAME,
  CINCH_NOTICE_TITLE,
  CINCH_PITS_LINE,
  CINCH_SIZE_LINE,
  CINCH_STILL_LINE,
  CINCH_TABLE_LINE,
  CINCH_TOTE_LINE,
  isListingCinchOverlay,
  parseCinchListingIds,
} from "@/lib/listing-cinch";
import { listingCinchPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-cinch-it. Reads the cookie only. */
export async function ListingCinchNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseCinchListingIds(jar.get(CINCH_COOKIE_NAME)?.value);

  if (!isListingCinchOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-cinch-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={CINCH_TABLE_LINE}
        title={CINCH_NOTICE_TITLE}
        body={`${CINCH_PITS_LINE} ${CINCH_SIZE_LINE} ${CINCH_STILL_LINE} ${CINCH_TOTE_LINE}`}
      >
        <Link
          href={listingCinchPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The cinch card
        </Link>
      </MallNotice>
    </div>
  );
}
