import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  GASP_BOLD_LINE,
  GASP_COOKIE_NAME,
  GASP_NOTICE_TITLE,
  GASP_STILL_LINE,
  GASP_TABLE_LINE,
  GASP_TOTE_LINE,
  GASP_WEIGHTS_LINE,
  isListingGaspOverlay,
  parseGaspListingIds,
} from "@/lib/listing-gasp";
import { listingGaspPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-gasp-it. Reads the cookie only. */
export async function ListingGaspNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseGaspListingIds(jar.get(GASP_COOKIE_NAME)?.value);

  if (!isListingGaspOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-gasp-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={GASP_TABLE_LINE}
        title={GASP_NOTICE_TITLE}
        body={`${GASP_WEIGHTS_LINE} ${GASP_BOLD_LINE} ${GASP_STILL_LINE} ${GASP_TOTE_LINE}`}
      >
        <Link
          href={listingGaspPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The gasp card
        </Link>
      </MallNotice>
    </div>
  );
}
