import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  BENT_COOKIE_NAME,
  BENT_FITS_LINE,
  BENT_HEAT_LINE,
  BENT_STILL_LINE,
  BENT_TABLE_LINE,
  BENT_TOTE_LINE,
  BENT_WHISK_LINE,
  isListingBentOverlay,
  parseBentListingIds,
} from "@/lib/listing-bent";
import { listingBentPath } from "@/lib/paths";

/** PDP banner when this SKU is a splayed whisk. Does not change the tote. */
export async function ListingBentNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseBentListingIds(jar.get(BENT_COOKIE_NAME)?.value);

  if (!isListingBentOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-bent-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Leave it bent"
        title={BENT_TABLE_LINE}
        body={`${BENT_HEAT_LINE} ${BENT_FITS_LINE} ${BENT_WHISK_LINE} ${BENT_STILL_LINE} ${BENT_TOTE_LINE}`}
      >
        <Link
          href={listingBentPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The bent-whisk card
        </Link>
      </MallNotice>
    </div>
  );
}
