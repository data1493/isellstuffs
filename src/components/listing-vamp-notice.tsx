import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  VAMP_COOKIE_NAME,
  VAMP_FLEX_LINE,
  VAMP_LACES_LINE,
  VAMP_NOTICE_TITLE,
  VAMP_STILL_LINE,
  VAMP_TABLE_LINE,
  VAMP_TOTE_LINE,
  isListingVampOverlay,
  parseVampListingIds,
} from "@/lib/listing-vamp";
import { listingVampPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-vamp-them. Reads the cookie only. */
export async function ListingVampNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseVampListingIds(jar.get(VAMP_COOKIE_NAME)?.value);

  if (!isListingVampOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-vamp-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={VAMP_TABLE_LINE}
        title={VAMP_NOTICE_TITLE}
        body={`${VAMP_FLEX_LINE} ${VAMP_LACES_LINE} ${VAMP_STILL_LINE} ${VAMP_TOTE_LINE}`}
      >
        <Link
          href={listingVampPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The vamp card
        </Link>
      </MallNotice>
    </div>
  );
}
