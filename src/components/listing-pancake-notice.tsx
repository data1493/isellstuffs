import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  PANCAKE_COOKIE_NAME,
  PANCAKE_HISS_LINE,
  PANCAKE_NOTICE_TITLE,
  PANCAKE_STILL_LINE,
  PANCAKE_SUMMER_LINE,
  PANCAKE_TABLE_LINE,
  PANCAKE_TOTE_LINE,
  isListingPancakeOverlay,
  parsePancakeListingIds,
} from "@/lib/listing-pancake";
import { listingPancakePath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-pancake-it. Reads the cookie only. */
export async function ListingPancakeNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parsePancakeListingIds(jar.get(PANCAKE_COOKIE_NAME)?.value);

  if (!isListingPancakeOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-pancake-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={PANCAKE_TABLE_LINE}
        title={PANCAKE_NOTICE_TITLE}
        body={`${PANCAKE_HISS_LINE} ${PANCAKE_SUMMER_LINE} ${PANCAKE_STILL_LINE} ${PANCAKE_TOTE_LINE}`}
      >
        <Link
          href={listingPancakePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The pancake card
        </Link>
      </MallNotice>
    </div>
  );
}
