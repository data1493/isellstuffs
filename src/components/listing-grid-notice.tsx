import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  GRID_COOKIE_NAME,
  GRID_NOTICE_TITLE,
  GRID_ONE_LINE,
  GRID_RULE_LINE,
  GRID_STILL_LINE,
  GRID_TABLE_LINE,
  GRID_TOTE_LINE,
  isListingGridOverlay,
  parseGridListingIds,
} from "@/lib/listing-grid";
import { listingGridPath } from "@/lib/paths";

/** PDP banner when this file stays one page. Does not change the tote. */
export async function ListingGridNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseGridListingIds(jar.get(GRID_COOKIE_NAME)?.value);

  if (!isListingGridOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-grid-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={GRID_TABLE_LINE}
        title={GRID_NOTICE_TITLE}
        body={`${GRID_ONE_LINE} ${GRID_RULE_LINE} ${GRID_STILL_LINE} ${GRID_TOTE_LINE}`}
      >
        <Link
          href={listingGridPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The grid card
        </Link>
      </MallNotice>
    </div>
  );
}
