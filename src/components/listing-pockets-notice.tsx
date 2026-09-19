import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  POCKETS_COOKIE_NAME,
  POCKETS_DIG_LINE,
  POCKETS_STILL_LINE,
  POCKETS_TABLE_LINE,
  POCKETS_TOTE_LINE,
  isListingPocketsOverlay,
  parsePocketsListingIds,
} from "@/lib/listing-pockets";
import { listingPocketsPath } from "@/lib/paths";

/** PDP banner when this SKU has emptied pockets. Does not change the tote. */
export async function ListingPocketsNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parsePocketsListingIds(jar.get(POCKETS_COOKIE_NAME)?.value);

  if (!isListingPocketsOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-pockets-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Pockets empty"
        title={POCKETS_TABLE_LINE}
        body={`${POCKETS_STILL_LINE} ${POCKETS_TOTE_LINE} ${POCKETS_DIG_LINE}`}
      >
        <Link
          href={listingPocketsPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The pocket card
        </Link>
      </MallNotice>
    </div>
  );
}
