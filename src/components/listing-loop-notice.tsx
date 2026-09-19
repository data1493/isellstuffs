import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  LOOP_COOKIE_NAME,
  LOOP_NOTICE_TITLE,
  LOOP_STEMS_LINE,
  LOOP_STAYS_LINE,
  LOOP_STILL_LINE,
  LOOP_TABLE_LINE,
  LOOP_TOTE_LINE,
  isListingLoopOverlay,
  parseLoopListingIds,
} from "@/lib/listing-loop";
import { listingLoopPath } from "@/lib/paths";

/** PDP banner when this file stays a loop. Does not change the tote. */
export async function ListingLoopNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseLoopListingIds(jar.get(LOOP_COOKIE_NAME)?.value);

  if (!isListingLoopOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-loop-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={LOOP_TABLE_LINE}
        title={LOOP_NOTICE_TITLE}
        body={`${LOOP_STAYS_LINE} ${LOOP_STEMS_LINE} ${LOOP_STILL_LINE} ${LOOP_TOTE_LINE}`}
      >
        <Link
          href={listingLoopPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The loop card
        </Link>
      </MallNotice>
    </div>
  );
}
