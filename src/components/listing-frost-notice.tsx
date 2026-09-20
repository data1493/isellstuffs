import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  FROST_COOKIE_NAME,
  FROST_LID_LINE,
  FROST_NOTICE_TITLE,
  FROST_POT_LINE,
  FROST_STILL_LINE,
  FROST_TABLE_LINE,
  FROST_TOTE_LINE,
  isListingFrostOverlay,
  parseFrostListingIds,
} from "@/lib/listing-frost";
import { listingFrostPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-frost-it. Reads the cookie only. */
export async function ListingFrostNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseFrostListingIds(jar.get(FROST_COOKIE_NAME)?.value);

  if (!isListingFrostOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-frost-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={FROST_TABLE_LINE}
        title={FROST_NOTICE_TITLE}
        body={`${FROST_LID_LINE} ${FROST_POT_LINE} ${FROST_STILL_LINE} ${FROST_TOTE_LINE}`}
      >
        <Link
          href={listingFrostPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The frost card
        </Link>
      </MallNotice>
    </div>
  );
}
