import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  DASHPOT_COOKIE_NAME,
  DASHPOT_NOTICE_TITLE,
  DASHPOT_SKIP_LINE,
  DASHPOT_STILL_LINE,
  DASHPOT_TABLE_LINE,
  DASHPOT_TOTE_LINE,
  DASHPOT_UNNAMED_LINE,
  isListingDashpotOverlay,
  parseDashpotListingIds,
} from "@/lib/listing-dashpot";
import { listingDashpotPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-dashpot-it. Reads the cookie only. */
export async function ListingDashpotNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseDashpotListingIds(jar.get(DASHPOT_COOKIE_NAME)?.value);

  if (!isListingDashpotOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-dashpot-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={DASHPOT_TABLE_LINE}
        title={DASHPOT_NOTICE_TITLE}
        body={`${DASHPOT_SKIP_LINE} ${DASHPOT_UNNAMED_LINE} ${DASHPOT_STILL_LINE} ${DASHPOT_TOTE_LINE}`}
      >
        <Link
          href={listingDashpotPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The dashpot card
        </Link>
      </MallNotice>
    </div>
  );
}
