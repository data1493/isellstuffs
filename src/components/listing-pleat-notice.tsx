import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  PLEAT_COOKIE_NAME,
  PLEAT_HOLE_LINE,
  PLEAT_JACKET_LINE,
  PLEAT_NOTICE_TITLE,
  PLEAT_STILL_LINE,
  PLEAT_TABLE_LINE,
  PLEAT_TOTE_LINE,
  isListingPleatOverlay,
  parsePleatListingIds,
} from "@/lib/listing-pleat";
import { listingPleatPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-pleat-it. Reads the cookie only. */
export async function ListingPleatNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parsePleatListingIds(jar.get(PLEAT_COOKIE_NAME)?.value);

  if (!isListingPleatOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-pleat-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={PLEAT_TABLE_LINE}
        title={PLEAT_NOTICE_TITLE}
        body={`${PLEAT_JACKET_LINE} ${PLEAT_HOLE_LINE} ${PLEAT_STILL_LINE} ${PLEAT_TOTE_LINE}`}
      >
        <Link
          href={listingPleatPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The pleat card
        </Link>
      </MallNotice>
    </div>
  );
}
