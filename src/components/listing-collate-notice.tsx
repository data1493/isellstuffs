import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  COLLATE_COOKIE_NAME,
  COLLATE_FOLD_LINE,
  COLLATE_NOTICE_TITLE,
  COLLATE_PAGE_LINE,
  COLLATE_STILL_LINE,
  COLLATE_TABLE_LINE,
  COLLATE_TOTE_LINE,
  isListingCollateOverlay,
  parseCollateListingIds,
} from "@/lib/listing-collate";
import { listingCollatePath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-collate-them. Reads the cookie only. */
export async function ListingCollateNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseCollateListingIds(jar.get(COLLATE_COOKIE_NAME)?.value);

  if (!isListingCollateOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-collate-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={COLLATE_TABLE_LINE}
        title={COLLATE_NOTICE_TITLE}
        body={`${COLLATE_PAGE_LINE} ${COLLATE_FOLD_LINE} ${COLLATE_STILL_LINE} ${COLLATE_TOTE_LINE}`}
      >
        <Link
          href={listingCollatePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The collate card
        </Link>
      </MallNotice>
    </div>
  );
}
