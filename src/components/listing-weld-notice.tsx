import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  WELD_COOKIE_NAME,
  WELD_EMPTIES_LINE,
  WELD_HINGE_LINE,
  WELD_NOTICE_TITLE,
  WELD_STILL_LINE,
  WELD_TABLE_LINE,
  WELD_TOTE_LINE,
  isListingWeldOverlay,
  parseWeldListingIds,
} from "@/lib/listing-weld";
import { listingWeldPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-weld-them. Reads the cookie only. */
export async function ListingWeldNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseWeldListingIds(jar.get(WELD_COOKIE_NAME)?.value);

  if (!isListingWeldOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-weld-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={WELD_TABLE_LINE}
        title={WELD_NOTICE_TITLE}
        body={`${WELD_EMPTIES_LINE} ${WELD_HINGE_LINE} ${WELD_STILL_LINE} ${WELD_TOTE_LINE}`}
      >
        <Link
          href={listingWeldPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The weld card
        </Link>
      </MallNotice>
    </div>
  );
}
