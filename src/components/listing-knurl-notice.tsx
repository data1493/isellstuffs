import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  KNURL_COOKIE_NAME,
  KNURL_LID_LINE,
  KNURL_LOOSE_LINE,
  KNURL_NOTICE_TITLE,
  KNURL_STILL_LINE,
  KNURL_TABLE_LINE,
  KNURL_TOTE_LINE,
  isListingKnurlOverlay,
  parseKnurlListingIds,
} from "@/lib/listing-knurl";
import { listingKnurlPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-knurl-it. Reads the cookie only. */
export async function ListingKnurlNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseKnurlListingIds(jar.get(KNURL_COOKIE_NAME)?.value);

  if (!isListingKnurlOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-knurl-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={KNURL_TABLE_LINE}
        title={KNURL_NOTICE_TITLE}
        body={`${KNURL_LOOSE_LINE} ${KNURL_LID_LINE} ${KNURL_STILL_LINE} ${KNURL_TOTE_LINE}`}
      >
        <Link
          href={listingKnurlPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The knurl card
        </Link>
      </MallNotice>
    </div>
  );
}
