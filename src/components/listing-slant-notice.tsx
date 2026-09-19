import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  SLANT_COOKIE_NAME,
  SLANT_FOUNDRY_LINE,
  SLANT_NOTICE_TITLE,
  SLANT_STILL_LINE,
  SLANT_TABLE_LINE,
  SLANT_TOTE_LINE,
  SLANT_WEIGHTS_LINE,
  isListingSlantOverlay,
  parseSlantListingIds,
} from "@/lib/listing-slant";
import { listingSlantPath } from "@/lib/paths";

/** PDP banner when this file stays regular and almost bold. Does not change the tote. */
export async function ListingSlantNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseSlantListingIds(jar.get(SLANT_COOKIE_NAME)?.value);

  if (!isListingSlantOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-slant-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={SLANT_TABLE_LINE}
        title={SLANT_NOTICE_TITLE}
        body={`${SLANT_WEIGHTS_LINE} ${SLANT_FOUNDRY_LINE} ${SLANT_STILL_LINE} ${SLANT_TOTE_LINE}`}
      >
        <Link
          href={listingSlantPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The slant card
        </Link>
      </MallNotice>
    </div>
  );
}
