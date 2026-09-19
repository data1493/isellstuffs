import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  CARDS_COOKIE_NAME,
  CARDS_NOTICE_TITLE,
  CARDS_SCAN_LINE,
  CARDS_STILL_LINE,
  CARDS_TABLE_LINE,
  CARDS_TOTE_LINE,
  CARDS_VIBE_LINE,
  isListingCardsOverlay,
  parseCardsListingIds,
} from "@/lib/listing-cards";
import { listingCardsPath } from "@/lib/paths";

/** PDP banner when the recipe cards stay scans. Does not change the tote. */
export async function ListingCardsNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseCardsListingIds(jar.get(CARDS_COOKIE_NAME)?.value);

  if (!isListingCardsOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-cards-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={CARDS_TABLE_LINE}
        title={CARDS_NOTICE_TITLE}
        body={`${CARDS_SCAN_LINE} ${CARDS_VIBE_LINE} ${CARDS_STILL_LINE} ${CARDS_TOTE_LINE}`}
      >
        <Link
          href={listingCardsPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The cards card
        </Link>
      </MallNotice>
    </div>
  );
}
