import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  FRINGE_COOKIE_NAME,
  FRINGE_LID_LINE,
  FRINGE_NOTICE_TITLE,
  FRINGE_POT_LINE,
  FRINGE_STILL_LINE,
  FRINGE_TABLE_LINE,
  FRINGE_TOTE_LINE,
  isListingFringeOverlay,
  parseFringeListingIds,
} from "@/lib/listing-fringe";
import { listingFringePath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-fringe-it. Reads the cookie only. */
export async function ListingFringeNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseFringeListingIds(jar.get(FRINGE_COOKIE_NAME)?.value);

  if (!isListingFringeOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-fringe-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={FRINGE_TABLE_LINE}
        title={FRINGE_NOTICE_TITLE}
        body={`${FRINGE_LID_LINE} ${FRINGE_POT_LINE} ${FRINGE_STILL_LINE} ${FRINGE_TOTE_LINE}`}
      >
        <Link
          href={listingFringePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The fringe card
        </Link>
      </MallNotice>
    </div>
  );
}
