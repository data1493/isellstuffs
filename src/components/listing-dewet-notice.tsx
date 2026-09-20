import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  DEWET_COOKIE_NAME,
  DEWET_CRACK_LINE,
  DEWET_NOTICE_TITLE,
  DEWET_STILL_LINE,
  DEWET_TABLE_LINE,
  DEWET_TETRIS_LINE,
  DEWET_TOTE_LINE,
  isListingDewetOverlay,
  parseDewetListingIds,
} from "@/lib/listing-dewet";
import { listingDewetPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-dewet-it. Reads the cookie only. */
export async function ListingDewetNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseDewetListingIds(jar.get(DEWET_COOKIE_NAME)?.value);

  if (!isListingDewetOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-dewet-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={DEWET_TABLE_LINE}
        title={DEWET_NOTICE_TITLE}
        body={`${DEWET_CRACK_LINE} ${DEWET_TETRIS_LINE} ${DEWET_STILL_LINE} ${DEWET_TOTE_LINE}`}
      >
        <Link
          href={listingDewetPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The dewet card
        </Link>
      </MallNotice>
    </div>
  );
}
