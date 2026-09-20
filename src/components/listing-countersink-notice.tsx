import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  COUNTERSINK_COOKIE_NAME,
  COUNTERSINK_LID_LINE,
  COUNTERSINK_NOTICE_TITLE,
  COUNTERSINK_POT_LINE,
  COUNTERSINK_STILL_LINE,
  COUNTERSINK_TABLE_LINE,
  COUNTERSINK_TOTE_LINE,
  isListingCountersinkOverlay,
  parseCountersinkListingIds,
} from "@/lib/listing-countersink";
import { listingCountersinkPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-countersink-it. Reads the cookie only. */
export async function ListingCountersinkNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseCountersinkListingIds(
    jar.get(COUNTERSINK_COOKIE_NAME)?.value,
  );

  if (!isListingCountersinkOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-countersink-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={COUNTERSINK_TABLE_LINE}
        title={COUNTERSINK_NOTICE_TITLE}
        body={`${COUNTERSINK_LID_LINE} ${COUNTERSINK_POT_LINE} ${COUNTERSINK_STILL_LINE} ${COUNTERSINK_TOTE_LINE}`}
      >
        <Link
          href={listingCountersinkPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The countersink card
        </Link>
      </MallNotice>
    </div>
  );
}
