import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  FILL_COOKIE_NAME,
  FILL_DISC_LINE,
  FILL_NOTICE_TITLE,
  FILL_SNAP_LINE,
  FILL_STILL_LINE,
  FILL_TABLE_LINE,
  FILL_TOTE_LINE,
  isListingFillOverlay,
  parseFillListingIds,
} from "@/lib/listing-fill";
import { listingFillPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-fill-it. Reads the cookie only. */
export async function ListingFillNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseFillListingIds(jar.get(FILL_COOKIE_NAME)?.value);

  if (!isListingFillOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-fill-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={FILL_TABLE_LINE}
        title={FILL_NOTICE_TITLE}
        body={`${FILL_DISC_LINE} ${FILL_SNAP_LINE} ${FILL_STILL_LINE} ${FILL_TOTE_LINE}`}
      >
        <Link
          href={listingFillPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The fill card
        </Link>
      </MallNotice>
    </div>
  );
}
