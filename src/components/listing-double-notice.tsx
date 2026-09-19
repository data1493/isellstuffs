import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  DOUBLE_CARDS_LINE,
  DOUBLE_COOKIE_NAME,
  DOUBLE_NOTICE_TITLE,
  DOUBLE_STILL_LINE,
  DOUBLE_TABLE_LINE,
  DOUBLE_TOTE_LINE,
  DOUBLE_VIBE_LINE,
  isListingDoubleOverlay,
  parseDoubleListingIds,
} from "@/lib/listing-double";
import { listingDoublePath } from "@/lib/paths";

/** PDP banner when the recipe cards stay three. Does not change the tote. */
export async function ListingDoubleNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseDoubleListingIds(jar.get(DOUBLE_COOKIE_NAME)?.value);

  if (!isListingDoubleOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-double-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={DOUBLE_TABLE_LINE}
        title={DOUBLE_NOTICE_TITLE}
        body={`${DOUBLE_CARDS_LINE} ${DOUBLE_VIBE_LINE} ${DOUBLE_STILL_LINE} ${DOUBLE_TOTE_LINE}`}
      >
        <Link
          href={listingDoublePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The double card
        </Link>
      </MallNotice>
    </div>
  );
}
