import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  WASH_COOKIE_NAME,
  WASH_JACKET_LINE,
  WASH_SIZE_LINE,
  WASH_SMOKE_LINE,
  WASH_STILL_LINE,
  WASH_TABLE_LINE,
  WASH_TOTE_LINE,
  isListingWashOverlay,
  parseWashListingIds,
} from "@/lib/listing-wash";
import { listingWashPath } from "@/lib/paths";

/** PDP banner when this SKU went through a machine. Does not change the tote. */
export async function ListingWashNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseWashListingIds(jar.get(WASH_COOKIE_NAME)?.value);

  if (!isListingWashOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-wash-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I washed it"
        title={WASH_TABLE_LINE}
        body={`${WASH_SMOKE_LINE} ${WASH_SIZE_LINE} ${WASH_JACKET_LINE} ${WASH_STILL_LINE} ${WASH_TOTE_LINE}`}
      >
        <Link
          href={listingWashPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The wash card
        </Link>
      </MallNotice>
    </div>
  );
}
