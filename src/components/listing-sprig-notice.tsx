import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  SPRIG_CHIP_LINE,
  SPRIG_COOKIE_NAME,
  SPRIG_MUG_LINE,
  SPRIG_NOTICE_TITLE,
  SPRIG_STILL_LINE,
  SPRIG_TABLE_LINE,
  SPRIG_TOTE_LINE,
  isListingSprigOverlay,
  parseSprigListingIds,
} from "@/lib/listing-sprig";
import { listingSprigPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-sprig-it. Reads the cookie only. */
export async function ListingSprigNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseSprigListingIds(jar.get(SPRIG_COOKIE_NAME)?.value);

  if (!isListingSprigOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-sprig-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={SPRIG_TABLE_LINE}
        title={SPRIG_NOTICE_TITLE}
        body={`${SPRIG_CHIP_LINE} ${SPRIG_MUG_LINE} ${SPRIG_STILL_LINE} ${SPRIG_TOTE_LINE}`}
      >
        <Link
          href={listingSprigPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The sprig card
        </Link>
      </MallNotice>
    </div>
  );
}
