import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  SOLE_COOKIE_NAME,
  SOLE_LACES_LINE,
  SOLE_STAYS_LINE,
  SOLE_STILL_LINE,
  SOLE_TABLE_LINE,
  SOLE_TOE_LINE,
  SOLE_TOTE_LINE,
  SOLE_WALK_LINE,
  isListingSoleOverlay,
  parseSoleListingIds,
} from "@/lib/listing-sole";
import { listingSolePath } from "@/lib/paths";

/** PDP banner when this SKU is taped I-will-not-resole. Does not change the tote. */
export async function ListingSoleNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseSoleListingIds(jar.get(SOLE_COOKIE_NAME)?.value);

  if (!isListingSoleOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-sole-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I will not resole"
        title={SOLE_TABLE_LINE}
        body={`${SOLE_TOE_LINE} ${SOLE_LACES_LINE} ${SOLE_STAYS_LINE} ${SOLE_WALK_LINE} ${SOLE_STILL_LINE} ${SOLE_TOTE_LINE}`}
      >
        <Link
          href={listingSolePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The sole card
        </Link>
      </MallNotice>
    </div>
  );
}
