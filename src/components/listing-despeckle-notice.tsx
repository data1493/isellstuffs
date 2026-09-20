import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  DESPECKLE_CARDS_LINE,
  DESPECKLE_COOKIE_NAME,
  DESPECKLE_GREASE_LINE,
  DESPECKLE_NOTICE_TITLE,
  DESPECKLE_STILL_LINE,
  DESPECKLE_TABLE_LINE,
  DESPECKLE_TOTE_LINE,
  isListingDespeckleOverlay,
  parseDespeckleListingIds,
} from "@/lib/listing-despeckle";
import { listingDespecklePath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-despeckle-them. Reads the cookie only. */
export async function ListingDespeckleNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseDespeckleListingIds(jar.get(DESPECKLE_COOKIE_NAME)?.value);

  if (!isListingDespeckleOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-despeckle-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={DESPECKLE_TABLE_LINE}
        title={DESPECKLE_NOTICE_TITLE}
        body={`${DESPECKLE_CARDS_LINE} ${DESPECKLE_GREASE_LINE} ${DESPECKLE_STILL_LINE} ${DESPECKLE_TOTE_LINE}`}
      >
        <Link
          href={listingDespecklePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The despeckle card
        </Link>
      </MallNotice>
    </div>
  );
}
