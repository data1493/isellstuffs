import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  YEAR_COOKIE_NAME,
  YEAR_NOTICE_TITLE,
  YEAR_PAGE_LINE,
  YEAR_STILL_LINE,
  YEAR_SUMMER_LINE,
  YEAR_TABLE_LINE,
  YEAR_TOTE_LINE,
  isListingYearOverlay,
  parseYearListingIds,
} from "@/lib/listing-year";
import { listingYearPath } from "@/lib/paths";

/** PDP banner when this file stays summer-ish. Reads the cookie only. */
export async function ListingYearNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseYearListingIds(jar.get(YEAR_COOKIE_NAME)?.value);

  if (!isListingYearOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-year-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={YEAR_TABLE_LINE}
        title={YEAR_NOTICE_TITLE}
        body={`${YEAR_SUMMER_LINE} ${YEAR_PAGE_LINE} ${YEAR_STILL_LINE} ${YEAR_TOTE_LINE}`}
      >
        <Link
          href={listingYearPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The year card
        </Link>
      </MallNotice>
    </div>
  );
}
