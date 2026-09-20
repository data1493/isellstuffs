import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  ACES_COOKIE_NAME,
  ACES_FLUOR_LINE,
  ACES_LOT_LINE,
  ACES_NOTICE_TITLE,
  ACES_STILL_LINE,
  ACES_TABLE_LINE,
  ACES_TOTE_LINE,
  isListingAcesOverlay,
  parseAcesListingIds,
} from "@/lib/listing-aces";
import { listingAcesPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-aces-it. Reads the cookie only. */
export async function ListingAcesNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseAcesListingIds(jar.get(ACES_COOKIE_NAME)?.value);

  if (!isListingAcesOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-aces-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={ACES_TABLE_LINE}
        title={ACES_NOTICE_TITLE}
        body={`${ACES_LOT_LINE} ${ACES_FLUOR_LINE} ${ACES_STILL_LINE} ${ACES_TOTE_LINE}`}
      >
        <Link
          href={listingAcesPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The aces card
        </Link>
      </MallNotice>
    </div>
  );
}
