import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  DETUNE_COOKIE_NAME,
  DETUNE_FOUR_LINE,
  DETUNE_NOTICE_TITLE,
  DETUNE_SLAPS_LINE,
  DETUNE_STILL_LINE,
  DETUNE_TABLE_LINE,
  DETUNE_TOTE_LINE,
  isListingDetuneOverlay,
  parseDetuneListingIds,
} from "@/lib/listing-detune";
import { listingDetunePath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-detune-them. Reads the cookie only. */
export async function ListingDetuneNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseDetuneListingIds(jar.get(DETUNE_COOKIE_NAME)?.value);

  if (!isListingDetuneOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-detune-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={DETUNE_TABLE_LINE}
        title={DETUNE_NOTICE_TITLE}
        body={`${DETUNE_SLAPS_LINE} ${DETUNE_FOUR_LINE} ${DETUNE_STILL_LINE} ${DETUNE_TOTE_LINE}`}
      >
        <Link
          href={listingDetunePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The detune card
        </Link>
      </MallNotice>
    </div>
  );
}
