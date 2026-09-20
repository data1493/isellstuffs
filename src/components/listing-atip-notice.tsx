import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  ATIP_COOKIE_NAME,
  ATIP_JEWEL_LINE,
  ATIP_NOTICE_TITLE,
  ATIP_SHARPIE_LINE,
  ATIP_STILL_LINE,
  ATIP_TABLE_LINE,
  ATIP_TOTE_LINE,
  isListingAtipOverlay,
  parseAtipListingIds,
} from "@/lib/listing-atip";
import { listingAtipPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-atip-it. Reads the cookie only. */
export async function ListingAtipNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseAtipListingIds(jar.get(ATIP_COOKIE_NAME)?.value);

  if (!isListingAtipOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-atip-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={ATIP_TABLE_LINE}
        title={ATIP_NOTICE_TITLE}
        body={`${ATIP_SHARPIE_LINE} ${ATIP_JEWEL_LINE} ${ATIP_STILL_LINE} ${ATIP_TOTE_LINE}`}
      >
        <Link
          href={listingAtipPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The atip card
        </Link>
      </MallNotice>
    </div>
  );
}
