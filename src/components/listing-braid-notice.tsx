import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  BRAID_COOKIE_NAME,
  BRAID_NOTICE_TITLE,
  BRAID_PILE_LINE,
  BRAID_STILL_LINE,
  BRAID_TABLE_LINE,
  BRAID_TOTE_LINE,
  BRAID_UNTESTED_LINE,
  isListingBraidOverlay,
  parseBraidListingIds,
} from "@/lib/listing-braid";
import { listingBraidPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-braid-them. Reads the cookie only. */
export async function ListingBraidNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseBraidListingIds(jar.get(BRAID_COOKIE_NAME)?.value);

  if (!isListingBraidOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-braid-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={BRAID_TABLE_LINE}
        title={BRAID_NOTICE_TITLE}
        body={`${BRAID_PILE_LINE} ${BRAID_UNTESTED_LINE} ${BRAID_STILL_LINE} ${BRAID_TOTE_LINE}`}
      >
        <Link
          href={listingBraidPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The braid card
        </Link>
      </MallNotice>
    </div>
  );
}
