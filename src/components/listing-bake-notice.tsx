import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  BAKE_COOKIE_NAME,
  BAKE_NOTICE_TITLE,
  BAKE_REWIND_LINE,
  BAKE_STILL_LINE,
  BAKE_TABLE_LINE,
  BAKE_TOTE_LINE,
  isListingBakeOverlay,
  parseBakeListingIds,
} from "@/lib/listing-bake";
import { listingBakePath } from "@/lib/paths";

/** PDP banner when this SKU is taped I-will-not-bake. Does not change the tote. */
export async function ListingBakeNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseBakeListingIds(jar.get(BAKE_COOKIE_NAME)?.value);

  if (!isListingBakeOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-bake-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={BAKE_TABLE_LINE}
        title={BAKE_NOTICE_TITLE}
        body={`${BAKE_REWIND_LINE} ${BAKE_STILL_LINE} ${BAKE_TOTE_LINE}`}
      >
        <Link
          href={listingBakePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The bake card
        </Link>
      </MallNotice>
    </div>
  );
}
