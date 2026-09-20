import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  TRUSS_BENT_LINE,
  TRUSS_COOKIE_NAME,
  TRUSS_METAL_LINE,
  TRUSS_NOTICE_TITLE,
  TRUSS_STILL_LINE,
  TRUSS_TABLE_LINE,
  TRUSS_TOTE_LINE,
  isListingTrussOverlay,
  parseTrussListingIds,
} from "@/lib/listing-truss";
import { listingTrussPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-truss-it. Reads the cookie only. */
export async function ListingTrussNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseTrussListingIds(jar.get(TRUSS_COOKIE_NAME)?.value);

  if (!isListingTrussOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-truss-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={TRUSS_TABLE_LINE}
        title={TRUSS_NOTICE_TITLE}
        body={`${TRUSS_BENT_LINE} ${TRUSS_METAL_LINE} ${TRUSS_STILL_LINE} ${TRUSS_TOTE_LINE}`}
      >
        <Link
          href={listingTrussPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The truss card
        </Link>
      </MallNotice>
    </div>
  );
}
