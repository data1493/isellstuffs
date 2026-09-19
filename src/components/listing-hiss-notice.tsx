import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  HISS_COOKIE_NAME,
  HISS_PLAYS_LINE,
  HISS_SKIP_LINE,
  HISS_STILL_LINE,
  HISS_TABLE_LINE,
  HISS_TAPE_LINE,
  HISS_TOTE_LINE,
  isListingHissOverlay,
  parseHissListingIds,
} from "@/lib/listing-hiss";
import { listingHissPath } from "@/lib/paths";

/** PDP banner when this SKU still hisses. Does not change the tote. */
export async function ListingHissNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseHissListingIds(jar.get(HISS_COOKIE_NAME)?.value);

  if (!isListingHissOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-hiss-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="The hiss stays"
        title={HISS_TABLE_LINE}
        body={`${HISS_TAPE_LINE} ${HISS_SKIP_LINE} ${HISS_PLAYS_LINE} ${HISS_STILL_LINE} ${HISS_TOTE_LINE}`}
      >
        <Link
          href={listingHissPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The hiss card
        </Link>
      </MallNotice>
    </div>
  );
}
