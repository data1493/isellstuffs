import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  FIRM_COOKIE_NAME,
  FIRM_OFFER_LINE,
  FIRM_SELLER_LINE,
  FIRM_TABLE_LINE,
  FIRM_TOTE_LINE,
  isListingFirmOverlay,
  parseFirmListingIds,
} from "@/lib/firm-price";
import { listingFirmPath } from "@/lib/paths";

/** PDP banner when this SKU is firm. Does not change the tote or the tag. */
export async function ListingFirmNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseFirmListingIds(jar.get(FIRM_COOKIE_NAME)?.value);

  if (!isListingFirmOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-firm-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="That's the price"
        title={FIRM_TABLE_LINE}
        body={`${FIRM_SELLER_LINE} ${FIRM_TOTE_LINE} ${FIRM_OFFER_LINE}`}
      >
        <Link
          href={listingFirmPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The firm paper
        </Link>
      </MallNotice>
    </div>
  );
}
