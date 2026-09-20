import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  BISQUE_CHIP_LINE,
  BISQUE_COOKIE_NAME,
  BISQUE_MUG_LINE,
  BISQUE_NOTICE_TITLE,
  BISQUE_STILL_LINE,
  BISQUE_TABLE_LINE,
  BISQUE_TOTE_LINE,
  isListingBisqueOverlay,
  parseBisqueListingIds,
} from "@/lib/listing-bisque";
import { listingBisquePath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-bisque-it. Reads the cookie only. */
export async function ListingBisqueNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseBisqueListingIds(jar.get(BISQUE_COOKIE_NAME)?.value);

  if (!isListingBisqueOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-bisque-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={BISQUE_TABLE_LINE}
        title={BISQUE_NOTICE_TITLE}
        body={`${BISQUE_MUG_LINE} ${BISQUE_CHIP_LINE} ${BISQUE_STILL_LINE} ${BISQUE_TOTE_LINE}`}
      >
        <Link
          href={listingBisquePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The bisque card
        </Link>
      </MallNotice>
    </div>
  );
}
