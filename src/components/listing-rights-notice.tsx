import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  RIGHTS_COOKIE_NAME,
  RIGHTS_NOTICE_TITLE,
  RIGHTS_STAYS_LINE,
  RIGHTS_STILL_LINE,
  RIGHTS_TABLE_LINE,
  RIGHTS_TOTE_LINE,
  RIGHTS_WALK_LINE,
  isListingRightsOverlay,
  parseRightsListingIds,
} from "@/lib/listing-rights";
import { listingRightsPath } from "@/lib/paths";

/** PDP banner when this file stays uncleared. Does not change the tote. */
export async function ListingRightsNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseRightsListingIds(jar.get(RIGHTS_COOKIE_NAME)?.value);

  if (!isListingRightsOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-rights-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={RIGHTS_TABLE_LINE}
        title={RIGHTS_NOTICE_TITLE}
        body={`${RIGHTS_STAYS_LINE} ${RIGHTS_WALK_LINE} ${RIGHTS_STILL_LINE} ${RIGHTS_TOTE_LINE}`}
      >
        <Link
          href={listingRightsPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The rights card
        </Link>
      </MallNotice>
    </div>
  );
}
