import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  WARP_COOKIE_NAME,
  WARP_NOTICE_TITLE,
  WARP_PLAYS_LINE,
  WARP_STAYS_LINE,
  WARP_STILL_LINE,
  WARP_TABLE_LINE,
  WARP_TOTE_LINE,
  isListingWarpOverlay,
  parseWarpListingIds,
} from "@/lib/listing-warp";
import { listingWarpPath } from "@/lib/paths";

/** PDP banner when this SKU is taped I-will-not-flatten. Reads the cookie only. */
export async function ListingWarpNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseWarpListingIds(jar.get(WARP_COOKIE_NAME)?.value);

  if (!isListingWarpOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-warp-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={WARP_TABLE_LINE}
        title={WARP_NOTICE_TITLE}
        body={`${WARP_STAYS_LINE} ${WARP_PLAYS_LINE} ${WARP_STILL_LINE} ${WARP_TOTE_LINE}`}
      >
        <Link
          href={listingWarpPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The warp card
        </Link>
      </MallNotice>
    </div>
  );
}
