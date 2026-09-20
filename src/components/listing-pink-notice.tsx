import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  PINK_CAR_LINE,
  PINK_COOKIE_NAME,
  PINK_MINT_LINE,
  PINK_NOTICE_TITLE,
  PINK_STILL_LINE,
  PINK_TABLE_LINE,
  PINK_TOTE_LINE,
  isListingPinkOverlay,
  parsePinkListingIds,
} from "@/lib/listing-pink";
import { listingPinkPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-pink-it. Reads the cookie only. */
export async function ListingPinkNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parsePinkListingIds(jar.get(PINK_COOKIE_NAME)?.value);

  if (!isListingPinkOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-pink-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={PINK_TABLE_LINE}
        title={PINK_NOTICE_TITLE}
        body={`${PINK_MINT_LINE} ${PINK_CAR_LINE} ${PINK_STILL_LINE} ${PINK_TOTE_LINE}`}
      >
        <Link
          href={listingPinkPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The pink card
        </Link>
      </MallNotice>
    </div>
  );
}
