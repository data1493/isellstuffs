import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  PLAYS_COOKIE_NAME,
  PLAYS_PRESS_LINE,
  PLAYS_SPIN_LINE,
  PLAYS_STILL_LINE,
  PLAYS_TABLE_LINE,
  PLAYS_TOTE_LINE,
  isListingPlaysOverlay,
  parsePlaysListingIds,
} from "@/lib/listing-plays";
import { listingPlaysPath } from "@/lib/paths";

/** PDP banner when this SKU already spun. Does not change the tote. */
export async function ListingPlaysNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parsePlaysListingIds(jar.get(PLAYS_COOKIE_NAME)?.value);

  if (!isListingPlaysOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-plays-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I played it once"
        title={PLAYS_TABLE_LINE}
        body={`${PLAYS_PRESS_LINE} ${PLAYS_SPIN_LINE} ${PLAYS_STILL_LINE} ${PLAYS_TOTE_LINE}`}
      >
        <Link
          href={listingPlaysPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The plays card
        </Link>
      </MallNotice>
    </div>
  );
}
