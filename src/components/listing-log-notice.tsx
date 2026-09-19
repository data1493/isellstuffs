import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  LOG_COOKIE_NAME,
  LOG_CUBES_LINE,
  LOG_LOOKS_LINE,
  LOG_NOTICE_TITLE,
  LOG_STILL_LINE,
  LOG_TABLE_LINE,
  LOG_TOTE_LINE,
  LOG_WALK_LINE,
  isListingLogOverlay,
  parseLogListingIds,
} from "@/lib/listing-log";
import { listingLogPath } from "@/lib/paths";

/** PDP banner when this file is taped I-will-not-unlog. Does not change the tote. */
export async function ListingLogNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseLogListingIds(jar.get(LOG_COOKIE_NAME)?.value);

  if (!isListingLogOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-log-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={LOG_TABLE_LINE}
        title={LOG_NOTICE_TITLE}
        body={`${LOG_LOOKS_LINE} ${LOG_CUBES_LINE} ${LOG_WALK_LINE} ${LOG_STILL_LINE} ${LOG_TOTE_LINE}`}
      >
        <Link
          href={listingLogPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The log card
        </Link>
      </MallNotice>
    </div>
  );
}
