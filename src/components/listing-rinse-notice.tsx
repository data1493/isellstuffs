import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  RINSE_COOKIE_NAME,
  RINSE_NOTICE_TITLE,
  RINSE_SKIP_LINE,
  RINSE_STILL_LINE,
  RINSE_TABLE_LINE,
  RINSE_TOTE_LINE,
  RINSE_UNNAMED_LINE,
  isListingRinseOverlay,
  parseRinseListingIds,
} from "@/lib/listing-rinse";
import { listingRinsePath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-rinse-it. Reads the cookie only. */
export async function ListingRinseNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseRinseListingIds(jar.get(RINSE_COOKIE_NAME)?.value);

  if (!isListingRinseOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-rinse-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={RINSE_TABLE_LINE}
        title={RINSE_NOTICE_TITLE}
        body={`${RINSE_SKIP_LINE} ${RINSE_UNNAMED_LINE} ${RINSE_STILL_LINE} ${RINSE_TOTE_LINE}`}
      >
        <Link
          href={listingRinsePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The rinse card
        </Link>
      </MallNotice>
    </div>
  );
}
