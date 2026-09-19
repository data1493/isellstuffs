import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  SLEEVE_BAG_LINE,
  SLEEVE_COOKIE_NAME,
  SLEEVE_JACKET_LINE,
  SLEEVE_PRESS_LINE,
  SLEEVE_SKIP_LINE,
  SLEEVE_STILL_LINE,
  SLEEVE_TABLE_LINE,
  SLEEVE_TOTE_LINE,
  isListingSleeveOverlay,
  parseSleeveListingIds,
} from "@/lib/listing-sleeve";
import { listingSleevePath } from "@/lib/paths";

/** PDP banner when this SKU is taped grocery-bag-sleeve. Does not change the tote. */
export async function ListingSleeveNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseSleeveListingIds(jar.get(SLEEVE_COOKIE_NAME)?.value);

  if (!isListingSleeveOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-sleeve-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Grocery bag sleeve"
        title={SLEEVE_TABLE_LINE}
        body={`${SLEEVE_SKIP_LINE} ${SLEEVE_PRESS_LINE} ${SLEEVE_BAG_LINE} ${SLEEVE_JACKET_LINE} ${SLEEVE_STILL_LINE} ${SLEEVE_TOTE_LINE}`}
      >
        <Link
          href={listingSleevePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The sleeve card
        </Link>
      </MallNotice>
    </div>
  );
}
