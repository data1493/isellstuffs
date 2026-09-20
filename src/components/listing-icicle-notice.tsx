import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  ICICLE_COOKIE_NAME,
  ICICLE_CRACK_LINE,
  ICICLE_NOTICE_TITLE,
  ICICLE_STILL_LINE,
  ICICLE_TABLE_LINE,
  ICICLE_TETRIS_LINE,
  ICICLE_TOTE_LINE,
  isListingIcicleOverlay,
  parseIcicleListingIds,
} from "@/lib/listing-icicle";
import { listingIciclePath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-icicle-it. Reads the cookie only. */
export async function ListingIcicleNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseIcicleListingIds(jar.get(ICICLE_COOKIE_NAME)?.value);

  if (!isListingIcicleOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-icicle-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={ICICLE_TABLE_LINE}
        title={ICICLE_NOTICE_TITLE}
        body={`${ICICLE_CRACK_LINE} ${ICICLE_TETRIS_LINE} ${ICICLE_STILL_LINE} ${ICICLE_TOTE_LINE}`}
      >
        <Link
          href={listingIciclePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The icicle card
        </Link>
      </MallNotice>
    </div>
  );
}
