import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  BLACKPAD_COOKIE_NAME,
  BLACKPAD_CRACK_LINE,
  BLACKPAD_NOTICE_TITLE,
  BLACKPAD_STILL_LINE,
  BLACKPAD_TABLE_LINE,
  BLACKPAD_TETRIS_LINE,
  BLACKPAD_TOTE_LINE,
  isListingBlackpadOverlay,
  parseBlackpadListingIds,
} from "@/lib/listing-blackpad";
import { listingBlackpadPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-blackpad-it. Reads the cookie only. */
export async function ListingBlackpadNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseBlackpadListingIds(jar.get(BLACKPAD_COOKIE_NAME)?.value);

  if (!isListingBlackpadOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-blackpad-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={BLACKPAD_TABLE_LINE}
        title={BLACKPAD_NOTICE_TITLE}
        body={`${BLACKPAD_CRACK_LINE} ${BLACKPAD_TETRIS_LINE} ${BLACKPAD_STILL_LINE} ${BLACKPAD_TOTE_LINE}`}
      >
        <Link
          href={listingBlackpadPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The blackpad card
        </Link>
      </MallNotice>
    </div>
  );
}
