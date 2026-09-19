import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  DEOX_COOKIE_NAME,
  DEOX_LINE_LINE,
  DEOX_NOTICE_TITLE,
  DEOX_STILL_LINE,
  DEOX_TABLE_LINE,
  DEOX_TETRIS_LINE,
  DEOX_TOTE_LINE,
  isListingDeoxOverlay,
  parseDeoxListingIds,
} from "@/lib/listing-deox";
import { listingDeoxPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-deox-it. Reads the cookie only. */
export async function ListingDeoxNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseDeoxListingIds(jar.get(DEOX_COOKIE_NAME)?.value);

  if (!isListingDeoxOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-deox-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={DEOX_TABLE_LINE}
        title={DEOX_NOTICE_TITLE}
        body={`${DEOX_LINE_LINE} ${DEOX_TETRIS_LINE} ${DEOX_STILL_LINE} ${DEOX_TOTE_LINE}`}
      >
        <Link
          href={listingDeoxPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The deox card
        </Link>
      </MallNotice>
    </div>
  );
}
