import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  ECCENTRIC_COOKIE_NAME,
  ECCENTRIC_NOTICE_TITLE,
  ECCENTRIC_SKIP_LINE,
  ECCENTRIC_STILL_LINE,
  ECCENTRIC_TABLE_LINE,
  ECCENTRIC_TOTE_LINE,
  ECCENTRIC_UNNAMED_LINE,
  isListingEccentricOverlay,
  parseEccentricListingIds,
} from "@/lib/listing-eccentric";
import { listingEccentricPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-eccentric-it. Reads the cookie only. */
export async function ListingEccentricNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseEccentricListingIds(jar.get(ECCENTRIC_COOKIE_NAME)?.value);

  if (!isListingEccentricOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-eccentric-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={ECCENTRIC_TABLE_LINE}
        title={ECCENTRIC_NOTICE_TITLE}
        body={`${ECCENTRIC_SKIP_LINE} ${ECCENTRIC_UNNAMED_LINE} ${ECCENTRIC_STILL_LINE} ${ECCENTRIC_TOTE_LINE}`}
      >
        <Link
          href={listingEccentricPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The eccentric card
        </Link>
      </MallNotice>
    </div>
  );
}
