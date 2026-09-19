import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  RIVET_BOX_LINE,
  RIVET_COOKIE_NAME,
  RIVET_NOTICE_TITLE,
  RIVET_OPTIONAL_LINE,
  RIVET_STILL_LINE,
  RIVET_TABLE_LINE,
  RIVET_TOTE_LINE,
  isListingRivetOverlay,
  parseRivetListingIds,
} from "@/lib/listing-rivet";
import { listingRivetPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-rivet-it. Reads the cookie only. */
export async function ListingRivetNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseRivetListingIds(jar.get(RIVET_COOKIE_NAME)?.value);

  if (!isListingRivetOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-rivet-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={RIVET_TABLE_LINE}
        title={RIVET_NOTICE_TITLE}
        body={`${RIVET_OPTIONAL_LINE} ${RIVET_BOX_LINE} ${RIVET_STILL_LINE} ${RIVET_TOTE_LINE}`}
      >
        <Link
          href={listingRivetPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The rivet card
        </Link>
      </MallNotice>
    </div>
  );
}
