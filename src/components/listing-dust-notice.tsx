import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  DUST_COOKIE_NAME,
  DUST_HAIR_LINE,
  DUST_STAYS_LINE,
  DUST_STILL_LINE,
  DUST_TABLE_LINE,
  DUST_TOTE_LINE,
  DUST_WASH_LINE,
  isListingDustOverlay,
  parseDustListingIds,
} from "@/lib/listing-dust";
import { listingDustPath } from "@/lib/paths";

/** PDP banner when this SKU is taped the-dust-stays. Does not change the tote. */
export async function ListingDustNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseDustListingIds(jar.get(DUST_COOKIE_NAME)?.value);

  if (!isListingDustOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-dust-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="The dust stays"
        title={DUST_TABLE_LINE}
        body={`${DUST_HAIR_LINE} ${DUST_WASH_LINE} ${DUST_STAYS_LINE} ${DUST_STILL_LINE} ${DUST_TOTE_LINE}`}
      >
        <Link
          href={listingDustPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The dust card
        </Link>
      </MallNotice>
    </div>
  );
}
