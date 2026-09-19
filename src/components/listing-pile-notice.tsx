import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  PILE_COOKIE_NAME,
  PILE_PARTS_LINE,
  PILE_STILL_LINE,
  PILE_TABLE_LINE,
  PILE_TAKE_LINE,
  PILE_TOTE_LINE,
  PILE_USB_LINE,
  isListingPileOverlay,
  parsePileListingIds,
} from "@/lib/listing-pile";
import { listingPilePath } from "@/lib/paths";

/** PDP banner when this SKU is the whole drawer. Does not change the tote. */
export async function ListingPileNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parsePileListingIds(jar.get(PILE_COOKIE_NAME)?.value);

  if (!isListingPileOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-pile-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Won't split the pile"
        title={PILE_TABLE_LINE}
        body={`${PILE_TAKE_LINE} ${PILE_PARTS_LINE} ${PILE_USB_LINE} ${PILE_STILL_LINE} ${PILE_TOTE_LINE}`}
      >
        <Link
          href={listingPilePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The pile card
        </Link>
      </MallNotice>
    </div>
  );
}
