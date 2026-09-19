import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  EVEN_COOKIE_NAME,
  EVEN_NOTICE_TITLE,
  EVEN_STILL_LINE,
  EVEN_TABLE_LINE,
  EVEN_TOE_LINE,
  EVEN_TOTE_LINE,
  isListingEvenOverlay,
  parseEvenListingIds,
} from "@/lib/listing-even";
import { listingEvenPath } from "@/lib/paths";

/** PDP banner when this SKU is taped I-will-not-even-the-wear. Does not change the tote. */
export async function ListingEvenNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseEvenListingIds(jar.get(EVEN_COOKIE_NAME)?.value);

  if (!isListingEvenOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-even-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={EVEN_TABLE_LINE}
        title={EVEN_NOTICE_TITLE}
        body={`${EVEN_TOE_LINE} ${EVEN_STILL_LINE} ${EVEN_TOTE_LINE}`}
      >
        <Link
          href={listingEvenPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The even card
        </Link>
      </MallNotice>
    </div>
  );
}
