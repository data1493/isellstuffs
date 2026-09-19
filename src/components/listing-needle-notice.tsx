import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  NEEDLE_COOKIE_NAME,
  NEEDLE_PARTS_LINE,
  NEEDLE_SKIP_LINE,
  NEEDLE_STILL_LINE,
  NEEDLE_STYLUS_LINE,
  NEEDLE_TABLE_LINE,
  NEEDLE_TOTE_LINE,
  isListingNeedleOverlay,
  parseNeedleListingIds,
} from "@/lib/listing-needle";
import { listingNeedlePath } from "@/lib/paths";

/** PDP banner when this SKU is taped needle-walked. Does not change the tote. */
export async function ListingNeedleNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseNeedleListingIds(jar.get(NEEDLE_COOKIE_NAME)?.value);

  if (!isListingNeedleOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-needle-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="The needle walked"
        title={NEEDLE_TABLE_LINE}
        body={`${NEEDLE_STYLUS_LINE} ${NEEDLE_STILL_LINE} ${NEEDLE_TOTE_LINE} ${NEEDLE_SKIP_LINE} ${NEEDLE_PARTS_LINE}`}
      >
        <Link
          href={listingNeedlePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The needle card
        </Link>
      </MallNotice>
    </div>
  );
}
