import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  TOE_COOKIE_NAME,
  TOE_LACES_LINE,
  TOE_OFFER_LINE,
  TOE_SOLE_LINE,
  TOE_STILL_LINE,
  TOE_TABLE_LINE,
  TOE_TOTE_LINE,
  isListingToeOverlay,
  parseToeListingIds,
} from "@/lib/listing-toe";
import { listingToePath } from "@/lib/paths";

/** PDP banner when this SKU is taped peel-stays. Does not change the tote. */
export async function ListingToeNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseToeListingIds(jar.get(TOE_COOKIE_NAME)?.value);

  if (!isListingToeOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-toe-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="The peel stays"
        title={TOE_TABLE_LINE}
        body={`${TOE_SOLE_LINE} ${TOE_STILL_LINE} ${TOE_TOTE_LINE} ${TOE_LACES_LINE} ${TOE_OFFER_LINE}`}
      >
        <Link
          href={listingToePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The peel card
        </Link>
      </MallNotice>
    </div>
  );
}
