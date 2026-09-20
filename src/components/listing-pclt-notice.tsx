import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  PCLT_BOLD_LINE,
  PCLT_COOKIE_NAME,
  PCLT_NOTICE_TITLE,
  PCLT_STILL_LINE,
  PCLT_TABLE_LINE,
  PCLT_TOTE_LINE,
  PCLT_WEIGHTS_LINE,
  isListingPcltOverlay,
  parsePcltListingIds,
} from "@/lib/listing-pclt";
import { listingPcltPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-pclt-it. Reads the cookie only. */
export async function ListingPcltNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parsePcltListingIds(jar.get(PCLT_COOKIE_NAME)?.value);

  if (!isListingPcltOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-pclt-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={PCLT_TABLE_LINE}
        title={PCLT_NOTICE_TITLE}
        body={`${PCLT_WEIGHTS_LINE} ${PCLT_BOLD_LINE} ${PCLT_STILL_LINE} ${PCLT_TOTE_LINE}`}
      >
        <Link
          href={listingPcltPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The pclt card
        </Link>
      </MallNotice>
    </div>
  );
}
