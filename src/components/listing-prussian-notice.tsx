import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  PRUSSIAN_COOKIE_NAME,
  PRUSSIAN_LID_LINE,
  PRUSSIAN_NOTICE_TITLE,
  PRUSSIAN_POT_LINE,
  PRUSSIAN_STILL_LINE,
  PRUSSIAN_TABLE_LINE,
  PRUSSIAN_TOTE_LINE,
  isListingPrussianOverlay,
  parsePrussianListingIds,
} from "@/lib/listing-prussian";
import { listingPrussianPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-prussian-it. Reads the cookie only. */
export async function ListingPrussianNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parsePrussianListingIds(jar.get(PRUSSIAN_COOKIE_NAME)?.value);

  if (!isListingPrussianOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-prussian-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={PRUSSIAN_TABLE_LINE}
        title={PRUSSIAN_NOTICE_TITLE}
        body={`${PRUSSIAN_LID_LINE} ${PRUSSIAN_POT_LINE} ${PRUSSIAN_STILL_LINE} ${PRUSSIAN_TOTE_LINE}`}
      >
        <Link
          href={listingPrussianPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The prussian card
        </Link>
      </MallNotice>
    </div>
  );
}
