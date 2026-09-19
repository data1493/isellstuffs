import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  PUCK_BAG_LINE,
  PUCK_COOKIE_NAME,
  PUCK_NOTICE_TITLE,
  PUCK_SKIP_LINE,
  PUCK_STILL_LINE,
  PUCK_TABLE_LINE,
  PUCK_TOTE_LINE,
  isListingPuckOverlay,
  parsePuckListingIds,
} from "@/lib/listing-puck";
import { listingPuckPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-puck-it. Reads the cookie only. */
export async function ListingPuckNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parsePuckListingIds(jar.get(PUCK_COOKIE_NAME)?.value);

  if (!isListingPuckOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-puck-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={PUCK_TABLE_LINE}
        title={PUCK_NOTICE_TITLE}
        body={`${PUCK_SKIP_LINE} ${PUCK_BAG_LINE} ${PUCK_STILL_LINE} ${PUCK_TOTE_LINE}`}
      >
        <Link
          href={listingPuckPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The puck card
        </Link>
      </MallNotice>
    </div>
  );
}
