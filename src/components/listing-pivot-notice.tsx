import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  PIVOT_COOKIE_NAME,
  PIVOT_NOTICE_TITLE,
  PIVOT_SKIP_LINE,
  PIVOT_STILL_LINE,
  PIVOT_TABLE_LINE,
  PIVOT_TOTE_LINE,
  PIVOT_UNNAMED_LINE,
  isListingPivotOverlay,
  parsePivotListingIds,
} from "@/lib/listing-pivot";
import { listingPivotPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-pivot-it. Reads the cookie only. */
export async function ListingPivotNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parsePivotListingIds(jar.get(PIVOT_COOKIE_NAME)?.value);

  if (!isListingPivotOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-pivot-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={PIVOT_TABLE_LINE}
        title={PIVOT_NOTICE_TITLE}
        body={`${PIVOT_SKIP_LINE} ${PIVOT_UNNAMED_LINE} ${PIVOT_STILL_LINE} ${PIVOT_TOTE_LINE}`}
      >
        <Link
          href={listingPivotPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The pivot card
        </Link>
      </MallNotice>
    </div>
  );
}
