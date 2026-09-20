import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  DARN_COOKIE_NAME,
  DARN_HOLE_LINE,
  DARN_JACKET_LINE,
  DARN_NOTICE_TITLE,
  DARN_STILL_LINE,
  DARN_TABLE_LINE,
  DARN_TOTE_LINE,
  isListingDarnOverlay,
  parseDarnListingIds,
} from "@/lib/listing-darn";
import { listingDarnPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-darn-it. Reads the cookie only. */
export async function ListingDarnNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseDarnListingIds(jar.get(DARN_COOKIE_NAME)?.value);

  if (!isListingDarnOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-darn-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={DARN_TABLE_LINE}
        title={DARN_NOTICE_TITLE}
        body={`${DARN_JACKET_LINE} ${DARN_HOLE_LINE} ${DARN_STILL_LINE} ${DARN_TOTE_LINE}`}
      >
        <Link
          href={listingDarnPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The darn card
        </Link>
      </MallNotice>
    </div>
  );
}
