import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  SWAGE_BENT_LINE,
  SWAGE_COOKIE_NAME,
  SWAGE_METAL_LINE,
  SWAGE_NOTICE_TITLE,
  SWAGE_STILL_LINE,
  SWAGE_TABLE_LINE,
  SWAGE_TOTE_LINE,
  isListingSwageOverlay,
  parseSwageListingIds,
} from "@/lib/listing-swage";
import { listingSwagePath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-swage-it. Reads the cookie only. */
export async function ListingSwageNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseSwageListingIds(jar.get(SWAGE_COOKIE_NAME)?.value);

  if (!isListingSwageOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-swage-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={SWAGE_TABLE_LINE}
        title={SWAGE_NOTICE_TITLE}
        body={`${SWAGE_BENT_LINE} ${SWAGE_METAL_LINE} ${SWAGE_STILL_LINE} ${SWAGE_TOTE_LINE}`}
      >
        <Link
          href={listingSwagePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The swage card
        </Link>
      </MallNotice>
    </div>
  );
}
