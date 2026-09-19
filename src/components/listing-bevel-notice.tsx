import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  BEVEL_COOKIE_NAME,
  BEVEL_NOTICE_TITLE,
  BEVEL_SCRATCHED_LINE,
  BEVEL_SHARPIE_LINE,
  BEVEL_STILL_LINE,
  BEVEL_TABLE_LINE,
  BEVEL_TOTE_LINE,
  isListingBevelOverlay,
  parseBevelListingIds,
} from "@/lib/listing-bevel";
import { listingBevelPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-bevel-it. Reads the cookie only. */
export async function ListingBevelNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseBevelListingIds(jar.get(BEVEL_COOKIE_NAME)?.value);

  if (!isListingBevelOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-bevel-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={BEVEL_TABLE_LINE}
        title={BEVEL_NOTICE_TITLE}
        body={`${BEVEL_SCRATCHED_LINE} ${BEVEL_SHARPIE_LINE} ${BEVEL_STILL_LINE} ${BEVEL_TOTE_LINE}`}
      >
        <Link
          href={listingBevelPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The bevel card
        </Link>
      </MallNotice>
    </div>
  );
}
