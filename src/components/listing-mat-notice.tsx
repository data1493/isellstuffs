import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  MAT_COOKIE_NAME,
  MAT_NOTICE_TITLE,
  MAT_PAGE_LINE,
  MAT_STILL_LINE,
  MAT_TABLE_LINE,
  MAT_TOTE_LINE,
  MAT_WRONG_LINE,
  isListingMatOverlay,
  parseMatListingIds,
} from "@/lib/listing-mat";
import { listingMatPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-mat-it. Reads the cookie only. */
export async function ListingMatNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseMatListingIds(jar.get(MAT_COOKIE_NAME)?.value);

  if (!isListingMatOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-mat-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={MAT_TABLE_LINE}
        title={MAT_NOTICE_TITLE}
        body={`${MAT_PAGE_LINE} ${MAT_WRONG_LINE} ${MAT_STILL_LINE} ${MAT_TOTE_LINE}`}
      >
        <Link
          href={listingMatPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The mat card
        </Link>
      </MallNotice>
    </div>
  );
}
