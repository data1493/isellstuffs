import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  BSLN_BOLD_LINE,
  BSLN_COOKIE_NAME,
  BSLN_NOTICE_TITLE,
  BSLN_STILL_LINE,
  BSLN_TABLE_LINE,
  BSLN_TOTE_LINE,
  BSLN_WEIGHTS_LINE,
  isListingBslnOverlay,
  parseBslnListingIds,
} from "@/lib/listing-bsln";
import { listingBslnPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-bsln-it. Reads the cookie only. */
export async function ListingBslnNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseBslnListingIds(jar.get(BSLN_COOKIE_NAME)?.value);

  if (!isListingBslnOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-bsln-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={BSLN_TABLE_LINE}
        title={BSLN_NOTICE_TITLE}
        body={`${BSLN_WEIGHTS_LINE} ${BSLN_BOLD_LINE} ${BSLN_STILL_LINE} ${BSLN_TOTE_LINE}`}
      >
        <Link
          href={listingBslnPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The bsln card
        </Link>
      </MallNotice>
    </div>
  );
}
