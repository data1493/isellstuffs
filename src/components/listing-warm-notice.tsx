import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  WARM_CONVERT_LINE,
  WARM_COOKIE_NAME,
  WARM_LOOKS_LINE,
  WARM_NOTICE_TITLE,
  WARM_SHOT_LINE,
  WARM_STILL_LINE,
  WARM_TABLE_LINE,
  WARM_TOTE_LINE,
  WARM_WALK_LINE,
  isListingWarmOverlay,
  parseWarmListingIds,
} from "@/lib/listing-warm";
import { listingWarmPath } from "@/lib/paths";

/** PDP banner when this file is taped warm-stays-warm. Does not change the tote. */
export async function ListingWarmNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseWarmListingIds(jar.get(WARM_COOKIE_NAME)?.value);

  if (!isListingWarmOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-warm-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={WARM_TABLE_LINE}
        title={WARM_NOTICE_TITLE}
        body={`${WARM_LOOKS_LINE} ${WARM_SHOT_LINE} ${WARM_CONVERT_LINE} ${WARM_WALK_LINE} ${WARM_STILL_LINE} ${WARM_TOTE_LINE}`}
      >
        <Link
          href={listingWarmPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The warm card
        </Link>
      </MallNotice>
    </div>
  );
}
