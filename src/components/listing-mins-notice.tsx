import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  MINS_CARDS_LINE,
  MINS_COOKIE_NAME,
  MINS_MINUTES_LINE,
  MINS_NOTICE_TITLE,
  MINS_STILL_LINE,
  MINS_TABLE_LINE,
  MINS_TOTE_LINE,
  MINS_VIBE_LINE,
  MINS_WALK_LINE,
  isListingMinsOverlay,
  parseMinsListingIds,
} from "@/lib/listing-mins";
import { listingMinsPath } from "@/lib/paths";

/** PDP banner when this file is taped I-will-not-time-it. Does not change the tote. */
export async function ListingMinsNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseMinsListingIds(jar.get(MINS_COOKIE_NAME)?.value);

  if (!isListingMinsOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-mins-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={MINS_TABLE_LINE}
        title={MINS_NOTICE_TITLE}
        body={`${MINS_MINUTES_LINE} ${MINS_VIBE_LINE} ${MINS_CARDS_LINE} ${MINS_WALK_LINE} ${MINS_STILL_LINE} ${MINS_TOTE_LINE}`}
      >
        <Link
          href={listingMinsPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The minutes card
        </Link>
      </MallNotice>
    </div>
  );
}
