import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  GALLEY_COOKIE_NAME,
  GALLEY_NOTICE_TITLE,
  GALLEY_PAGE_LINE,
  GALLEY_STILL_LINE,
  GALLEY_TABLE_LINE,
  GALLEY_TOTE_LINE,
  GALLEY_WRONG_LINE,
  isListingGalleyOverlay,
  parseGalleyListingIds,
} from "@/lib/listing-galley";
import { listingGalleyPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-galley-it. Reads the cookie only. */
export async function ListingGalleyNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseGalleyListingIds(jar.get(GALLEY_COOKIE_NAME)?.value);

  if (!isListingGalleyOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-galley-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={GALLEY_TABLE_LINE}
        title={GALLEY_NOTICE_TITLE}
        body={`${GALLEY_PAGE_LINE} ${GALLEY_WRONG_LINE} ${GALLEY_STILL_LINE} ${GALLEY_TOTE_LINE}`}
      >
        <Link
          href={listingGalleyPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The galley card
        </Link>
      </MallNotice>
    </div>
  );
}
