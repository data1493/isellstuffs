import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  HAIR_COOKIE_NAME,
  HAIR_SMOKE_LINE,
  HAIR_STAYS_LINE,
  HAIR_STILL_LINE,
  HAIR_TABLE_LINE,
  HAIR_TOTE_LINE,
  HAIR_WASH_LINE,
  isListingHairOverlay,
  parseHairListingIds,
} from "@/lib/listing-hair";
import { listingHairPath } from "@/lib/paths";

/** PDP banner when this SKU is taped pet-hair-stays. Does not change the tote. */
export async function ListingHairNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseHairListingIds(jar.get(HAIR_COOKIE_NAME)?.value);

  if (!isListingHairOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-hair-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Pet hair stays"
        title={HAIR_TABLE_LINE}
        body={`${HAIR_SMOKE_LINE} ${HAIR_WASH_LINE} ${HAIR_STAYS_LINE} ${HAIR_STILL_LINE} ${HAIR_TOTE_LINE}`}
      >
        <Link
          href={listingHairPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The pet-hair card
        </Link>
      </MallNotice>
    </div>
  );
}
