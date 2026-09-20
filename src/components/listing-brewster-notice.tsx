import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  BREWSTER_COOKIE_NAME,
  BREWSTER_LID_LINE,
  BREWSTER_NOTICE_TITLE,
  BREWSTER_POT_LINE,
  BREWSTER_STILL_LINE,
  BREWSTER_TABLE_LINE,
  BREWSTER_TOTE_LINE,
  isListingBrewsterOverlay,
  parseBrewsterListingIds,
} from "@/lib/listing-brewster";
import { listingBrewsterPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-brewster-it. Reads the cookie only. */
export async function ListingBrewsterNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseBrewsterListingIds(jar.get(BREWSTER_COOKIE_NAME)?.value);

  if (!isListingBrewsterOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-brewster-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={BREWSTER_TABLE_LINE}
        title={BREWSTER_NOTICE_TITLE}
        body={`${BREWSTER_LID_LINE} ${BREWSTER_POT_LINE} ${BREWSTER_STILL_LINE} ${BREWSTER_TOTE_LINE}`}
      >
        <Link
          href={listingBrewsterPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The brewster card
        </Link>
      </MallNotice>
    </div>
  );
}
