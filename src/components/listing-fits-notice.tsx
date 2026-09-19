import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  FITS_COOKIE_NAME,
  FITS_STILL_LINE,
  FITS_TABLE_LINE,
  FITS_TOTE_LINE,
  FITS_WALKED_LINE,
  FITS_WITH_LINE,
  isListingFitsOverlay,
  parseFitsListingIds,
} from "@/lib/listing-fits";
import { listingFitsPath } from "@/lib/paths";

/** PDP banner when this SKU is taped to a 3-quart. Does not change the tote. */
export async function ListingFitsNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseFitsListingIds(jar.get(FITS_COOKIE_NAME)?.value);

  if (!isListingFitsOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-fits-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Fits a 3-quart"
        title={FITS_TABLE_LINE}
        body={`${FITS_WALKED_LINE} ${FITS_WITH_LINE} ${FITS_STILL_LINE} ${FITS_TOTE_LINE}`}
      >
        <Link
          href={listingFitsPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The 3-quart card
        </Link>
      </MallNotice>
    </div>
  );
}
