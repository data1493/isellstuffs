import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  RELAP_COOKIE_NAME,
  RELAP_HISS_LINE,
  RELAP_NOTICE_TITLE,
  RELAP_RADIO_LINE,
  RELAP_STILL_LINE,
  RELAP_TABLE_LINE,
  RELAP_TOTE_LINE,
  isListingRelapOverlay,
  parseRelapListingIds,
} from "@/lib/listing-relap";
import { listingRelapPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-relap-it. Reads the cookie only. */
export async function ListingRelapNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseRelapListingIds(jar.get(RELAP_COOKIE_NAME)?.value);

  if (!isListingRelapOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-relap-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={RELAP_TABLE_LINE}
        title={RELAP_NOTICE_TITLE}
        body={`${RELAP_HISS_LINE} ${RELAP_RADIO_LINE} ${RELAP_STILL_LINE} ${RELAP_TOTE_LINE}`}
      >
        <Link
          href={listingRelapPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The relap card
        </Link>
      </MallNotice>
    </div>
  );
}
