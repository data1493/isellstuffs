import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  NABS_COOKIE_NAME,
  NABS_HISS_LINE,
  NABS_NOTICE_TITLE,
  NABS_RADIO_LINE,
  NABS_STILL_LINE,
  NABS_TABLE_LINE,
  NABS_TOTE_LINE,
  isListingNabsOverlay,
  parseNabsListingIds,
} from "@/lib/listing-nabs";
import { listingNabsPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-nabs-it. Reads the cookie only. */
export async function ListingNabsNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseNabsListingIds(jar.get(NABS_COOKIE_NAME)?.value);

  if (!isListingNabsOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-nabs-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={NABS_TABLE_LINE}
        title={NABS_NOTICE_TITLE}
        body={`${NABS_HISS_LINE} ${NABS_RADIO_LINE} ${NABS_STILL_LINE} ${NABS_TOTE_LINE}`}
      >
        <Link
          href={listingNabsPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The nabs card
        </Link>
      </MallNotice>
    </div>
  );
}
