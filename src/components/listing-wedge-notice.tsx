import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  WEDGE_COOKIE_NAME,
  WEDGE_LID_LINE,
  WEDGE_NOTICE_TITLE,
  WEDGE_POT_LINE,
  WEDGE_STILL_LINE,
  WEDGE_TABLE_LINE,
  WEDGE_TOTE_LINE,
  isListingWedgeOverlay,
  parseWedgeListingIds,
} from "@/lib/listing-wedge";
import { listingWedgePath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-wedge-it. Reads the cookie only. */
export async function ListingWedgeNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseWedgeListingIds(jar.get(WEDGE_COOKIE_NAME)?.value);

  if (!isListingWedgeOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-wedge-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={WEDGE_TABLE_LINE}
        title={WEDGE_NOTICE_TITLE}
        body={`${WEDGE_LID_LINE} ${WEDGE_POT_LINE} ${WEDGE_STILL_LINE} ${WEDGE_TOTE_LINE}`}
      >
        <Link
          href={listingWedgePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The wedge card
        </Link>
      </MallNotice>
    </div>
  );
}
