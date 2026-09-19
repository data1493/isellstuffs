import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  SKIP_COOKIE_NAME,
  SKIP_PLAYS_LINE,
  SKIP_PRESS_LINE,
  SKIP_SIDE_LINE,
  SKIP_STILL_LINE,
  SKIP_TABLE_LINE,
  SKIP_TOTE_LINE,
  isListingSkipOverlay,
  parseSkipListingIds,
} from "@/lib/listing-skip";
import { listingSkipPath } from "@/lib/paths";

/** PDP banner when this SKU still skips. Does not change the tote. */
export async function ListingSkipNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseSkipListingIds(jar.get(SKIP_COOKIE_NAME)?.value);

  if (!isListingSkipOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-skip-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="The skip stays"
        title={SKIP_TABLE_LINE}
        body={`${SKIP_PRESS_LINE} ${SKIP_PLAYS_LINE} ${SKIP_SIDE_LINE} ${SKIP_STILL_LINE} ${SKIP_TOTE_LINE}`}
      >
        <Link
          href={listingSkipPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The skip card
        </Link>
      </MallNotice>
    </div>
  );
}
