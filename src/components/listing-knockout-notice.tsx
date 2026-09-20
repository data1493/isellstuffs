import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  KNOCKOUT_CARDS_LINE,
  KNOCKOUT_COOKIE_NAME,
  KNOCKOUT_GREASE_LINE,
  KNOCKOUT_NOTICE_TITLE,
  KNOCKOUT_STILL_LINE,
  KNOCKOUT_TABLE_LINE,
  KNOCKOUT_TOTE_LINE,
  isListingKnockoutOverlay,
  parseKnockoutListingIds,
} from "@/lib/listing-knockout";
import { listingKnockoutPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-knockout-them. Reads the cookie only. */
export async function ListingKnockoutNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseKnockoutListingIds(jar.get(KNOCKOUT_COOKIE_NAME)?.value);

  if (!isListingKnockoutOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-knockout-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={KNOCKOUT_TABLE_LINE}
        title={KNOCKOUT_NOTICE_TITLE}
        body={`${KNOCKOUT_CARDS_LINE} ${KNOCKOUT_GREASE_LINE} ${KNOCKOUT_STILL_LINE} ${KNOCKOUT_TOTE_LINE}`}
      >
        <Link
          href={listingKnockoutPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The knockout card
        </Link>
      </MallNotice>
    </div>
  );
}
