import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  WRING_COOKIE_NAME,
  WRING_LID_LINE,
  WRING_NOTICE_TITLE,
  WRING_POT_LINE,
  WRING_STILL_LINE,
  WRING_TABLE_LINE,
  WRING_TOTE_LINE,
  isListingWringOverlay,
  parseWringListingIds,
} from "@/lib/listing-wring";
import { listingWringPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-wring-it. Reads the cookie only. */
export async function ListingWringNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseWringListingIds(jar.get(WRING_COOKIE_NAME)?.value);

  if (!isListingWringOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-wring-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={WRING_TABLE_LINE}
        title={WRING_NOTICE_TITLE}
        body={`${WRING_LID_LINE} ${WRING_POT_LINE} ${WRING_STILL_LINE} ${WRING_TOTE_LINE}`}
      >
        <Link
          href={listingWringPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The wring card
        </Link>
      </MallNotice>
    </div>
  );
}
