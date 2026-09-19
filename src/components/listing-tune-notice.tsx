import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  TUNE_COOKIE_NAME,
  TUNE_NOTICE_TITLE,
  TUNE_STAYS_LINE,
  TUNE_STILL_LINE,
  TUNE_TABLE_LINE,
  TUNE_TOTE_LINE,
  TUNE_WALK_LINE,
  isListingTuneOverlay,
  parseTuneListingIds,
} from "@/lib/listing-tune";
import { listingTunePath } from "@/lib/paths";

/** PDP banner when this file stays as recorded. Does not change the tote. */
export async function ListingTuneNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseTuneListingIds(jar.get(TUNE_COOKIE_NAME)?.value);

  if (!isListingTuneOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-tune-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={TUNE_TABLE_LINE}
        title={TUNE_NOTICE_TITLE}
        body={`${TUNE_STAYS_LINE} ${TUNE_WALK_LINE} ${TUNE_STILL_LINE} ${TUNE_TOTE_LINE}`}
      >
        <Link
          href={listingTunePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The tune card
        </Link>
      </MallNotice>
    </div>
  );
}
