import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  FILLET_COOKIE_NAME,
  FILLET_CRACK_LINE,
  FILLET_NOTICE_TITLE,
  FILLET_STILL_LINE,
  FILLET_TABLE_LINE,
  FILLET_TETRIS_LINE,
  FILLET_TOTE_LINE,
  isListingFilletOverlay,
  parseFilletListingIds,
} from "@/lib/listing-fillet";
import { listingFilletPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-fillet-it. Reads the cookie only. */
export async function ListingFilletNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseFilletListingIds(jar.get(FILLET_COOKIE_NAME)?.value);

  if (!isListingFilletOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-fillet-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={FILLET_TABLE_LINE}
        title={FILLET_NOTICE_TITLE}
        body={`${FILLET_CRACK_LINE} ${FILLET_TETRIS_LINE} ${FILLET_STILL_LINE} ${FILLET_TOTE_LINE}`}
      >
        <Link
          href={listingFilletPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The fillet card
        </Link>
      </MallNotice>
    </div>
  );
}
