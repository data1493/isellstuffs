import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  CEMENT_COOKIE_NAME,
  CEMENT_NOTICE_TITLE,
  CEMENT_PEEL_LINE,
  CEMENT_STILL_LINE,
  CEMENT_TABLE_LINE,
  CEMENT_TOTE_LINE,
  CEMENT_WALK_LINE,
  isListingCementOverlay,
  parseCementListingIds,
} from "@/lib/listing-cement";
import { listingCementPath } from "@/lib/paths";

/** PDP banner when this SKU is taped I-will-not-cement. Does not change the tote. */
export async function ListingCementNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseCementListingIds(jar.get(CEMENT_COOKIE_NAME)?.value);

  if (!isListingCementOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-cement-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={CEMENT_TABLE_LINE}
        title={CEMENT_NOTICE_TITLE}
        body={`${CEMENT_PEEL_LINE} ${CEMENT_WALK_LINE} ${CEMENT_STILL_LINE} ${CEMENT_TOTE_LINE}`}
      >
        <Link
          href={listingCementPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The cement card
        </Link>
      </MallNotice>
    </div>
  );
}
