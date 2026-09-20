import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  CALENDER_CAR_LINE,
  CALENDER_COOKIE_NAME,
  CALENDER_MINT_LINE,
  CALENDER_NOTICE_TITLE,
  CALENDER_STILL_LINE,
  CALENDER_TABLE_LINE,
  CALENDER_TOTE_LINE,
  isListingCalenderOverlay,
  parseCalenderListingIds,
} from "@/lib/listing-calender";
import { listingCalenderPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-calender-it. Reads the cookie only. */
export async function ListingCalenderNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseCalenderListingIds(jar.get(CALENDER_COOKIE_NAME)?.value);

  if (!isListingCalenderOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-calender-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={CALENDER_TABLE_LINE}
        title={CALENDER_NOTICE_TITLE}
        body={`${CALENDER_MINT_LINE} ${CALENDER_CAR_LINE} ${CALENDER_STILL_LINE} ${CALENDER_TOTE_LINE}`}
      >
        <Link
          href={listingCalenderPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The calender card
        </Link>
      </MallNotice>
    </div>
  );
}
