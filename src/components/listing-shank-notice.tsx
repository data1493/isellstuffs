import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  SHANK_COOKIE_NAME,
  SHANK_FLEX_LINE,
  SHANK_LACES_LINE,
  SHANK_NOTICE_TITLE,
  SHANK_STILL_LINE,
  SHANK_TABLE_LINE,
  SHANK_TOTE_LINE,
  isListingShankOverlay,
  parseShankListingIds,
} from "@/lib/listing-shank";
import { listingShankPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-shank-them. Reads the cookie only. */
export async function ListingShankNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseShankListingIds(jar.get(SHANK_COOKIE_NAME)?.value);

  if (!isListingShankOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-shank-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={SHANK_TABLE_LINE}
        title={SHANK_NOTICE_TITLE}
        body={`${SHANK_FLEX_LINE} ${SHANK_LACES_LINE} ${SHANK_STILL_LINE} ${SHANK_TOTE_LINE}`}
      >
        <Link
          href={listingShankPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The shank card
        </Link>
      </MallNotice>
    </div>
  );
}
