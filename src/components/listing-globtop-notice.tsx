import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  GLOBTOP_COOKIE_NAME,
  GLOBTOP_CRACK_LINE,
  GLOBTOP_NOTICE_TITLE,
  GLOBTOP_STILL_LINE,
  GLOBTOP_TABLE_LINE,
  GLOBTOP_TETRIS_LINE,
  GLOBTOP_TOTE_LINE,
  isListingGlobtopOverlay,
  parseGlobtopListingIds,
} from "@/lib/listing-globtop";
import { listingGlobtopPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-globtop-it. Reads the cookie only. */
export async function ListingGlobtopNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseGlobtopListingIds(jar.get(GLOBTOP_COOKIE_NAME)?.value);

  if (!isListingGlobtopOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-globtop-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={GLOBTOP_TABLE_LINE}
        title={GLOBTOP_NOTICE_TITLE}
        body={`${GLOBTOP_CRACK_LINE} ${GLOBTOP_TETRIS_LINE} ${GLOBTOP_STILL_LINE} ${GLOBTOP_TOTE_LINE}`}
      >
        <Link
          href={listingGlobtopPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The globtop card
        </Link>
      </MallNotice>
    </div>
  );
}
