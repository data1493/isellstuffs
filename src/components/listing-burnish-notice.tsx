import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  BURNISH_COOKIE_NAME,
  BURNISH_NOTICE_TITLE,
  BURNISH_PAIR_LINE,
  BURNISH_PEEL_LINE,
  BURNISH_STILL_LINE,
  BURNISH_TABLE_LINE,
  BURNISH_TOTE_LINE,
  isListingBurnishOverlay,
  parseBurnishListingIds,
} from "@/lib/listing-burnish";
import { listingBurnishPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-burnish-it. Reads the cookie only. */
export async function ListingBurnishNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseBurnishListingIds(jar.get(BURNISH_COOKIE_NAME)?.value);

  if (!isListingBurnishOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-burnish-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={BURNISH_TABLE_LINE}
        title={BURNISH_NOTICE_TITLE}
        body={`${BURNISH_PAIR_LINE} ${BURNISH_PEEL_LINE} ${BURNISH_STILL_LINE} ${BURNISH_TOTE_LINE}`}
      >
        <Link
          href={listingBurnishPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The burnish card
        </Link>
      </MallNotice>
    </div>
  );
}
