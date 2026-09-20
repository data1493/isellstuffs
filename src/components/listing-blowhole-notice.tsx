import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  BLOWHOLE_COOKIE_NAME,
  BLOWHOLE_CRACK_LINE,
  BLOWHOLE_NOTICE_TITLE,
  BLOWHOLE_STILL_LINE,
  BLOWHOLE_TABLE_LINE,
  BLOWHOLE_TETRIS_LINE,
  BLOWHOLE_TOTE_LINE,
  isListingBlowholeOverlay,
  parseBlowholeListingIds,
} from "@/lib/listing-blowhole";
import { listingBlowholePath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-blowhole-it. Reads the cookie only. */
export async function ListingBlowholeNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseBlowholeListingIds(jar.get(BLOWHOLE_COOKIE_NAME)?.value);

  if (!isListingBlowholeOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-blowhole-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={BLOWHOLE_TABLE_LINE}
        title={BLOWHOLE_NOTICE_TITLE}
        body={`${BLOWHOLE_CRACK_LINE} ${BLOWHOLE_TETRIS_LINE} ${BLOWHOLE_STILL_LINE} ${BLOWHOLE_TOTE_LINE}`}
      >
        <Link
          href={listingBlowholePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The blowhole card
        </Link>
      </MallNotice>
    </div>
  );
}
