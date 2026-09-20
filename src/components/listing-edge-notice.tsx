import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  EDGE_COOKIE_NAME,
  EDGE_NOTICE_TITLE,
  EDGE_PAIR_LINE,
  EDGE_PEEL_LINE,
  EDGE_STILL_LINE,
  EDGE_TABLE_LINE,
  EDGE_TOTE_LINE,
  isListingEdgeOverlay,
  parseEdgeListingIds,
} from "@/lib/listing-edge";
import { listingEdgePath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-edge-it. Reads the cookie only. */
export async function ListingEdgeNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseEdgeListingIds(jar.get(EDGE_COOKIE_NAME)?.value);

  if (!isListingEdgeOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-edge-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={EDGE_TABLE_LINE}
        title={EDGE_NOTICE_TITLE}
        body={`${EDGE_PAIR_LINE} ${EDGE_PEEL_LINE} ${EDGE_STILL_LINE} ${EDGE_TOTE_LINE}`}
      >
        <Link
          href={listingEdgePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The edge card
        </Link>
      </MallNotice>
    </div>
  );
}
