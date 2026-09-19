import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  LIGATURE_COOKIE_NAME,
  LIGATURE_COURT_LINE,
  LIGATURE_NOTICE_TITLE,
  LIGATURE_STILL_LINE,
  LIGATURE_TABLE_LINE,
  LIGATURE_TOTE_LINE,
  LIGATURE_WEIGHTS_LINE,
  isListingLigatureOverlay,
  parseLigatureListingIds,
} from "@/lib/listing-ligature";
import { listingLigaturePath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-ligature-it. Reads the cookie only. */
export async function ListingLigatureNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseLigatureListingIds(jar.get(LIGATURE_COOKIE_NAME)?.value);

  if (!isListingLigatureOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-ligature-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={LIGATURE_TABLE_LINE}
        title={LIGATURE_NOTICE_TITLE}
        body={`${LIGATURE_WEIGHTS_LINE} ${LIGATURE_COURT_LINE} ${LIGATURE_STILL_LINE} ${LIGATURE_TOTE_LINE}`}
      >
        <Link
          href={listingLigaturePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The ligature card
        </Link>
      </MallNotice>
    </div>
  );
}
