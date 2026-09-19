import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  FOAM_COOKIE_NAME,
  FOAM_EMPTY_CASES_LINE,
  FOAM_NOTICE_TITLE,
  FOAM_PILE_LINE,
  FOAM_STILL_LINE,
  FOAM_TABLE_LINE,
  FOAM_TOTE_LINE,
  isListingFoamOverlay,
  parseFoamListingIds,
} from "@/lib/listing-foam";
import { listingFoamPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-foam-them. Reads the cookie only. */
export async function ListingFoamNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseFoamListingIds(jar.get(FOAM_COOKIE_NAME)?.value);

  if (!isListingFoamOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-foam-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={FOAM_TABLE_LINE}
        title={FOAM_NOTICE_TITLE}
        body={`${FOAM_PILE_LINE} ${FOAM_EMPTY_CASES_LINE} ${FOAM_STILL_LINE} ${FOAM_TOTE_LINE}`}
      >
        <Link
          href={listingFoamPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The foam card
        </Link>
      </MallNotice>
    </div>
  );
}
