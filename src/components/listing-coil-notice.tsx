import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  COIL_COOKIE_NAME,
  COIL_ENDS_LINE,
  COIL_NOTICE_TITLE,
  COIL_PILE_LINE,
  COIL_STILL_LINE,
  COIL_TABLE_LINE,
  COIL_TOTE_LINE,
  isListingCoilOverlay,
  parseCoilListingIds,
} from "@/lib/listing-coil";
import { listingCoilPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-coil-them. Reads the cookie only. */
export async function ListingCoilNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseCoilListingIds(jar.get(COIL_COOKIE_NAME)?.value);

  if (!isListingCoilOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-coil-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={COIL_TABLE_LINE}
        title={COIL_NOTICE_TITLE}
        body={`${COIL_PILE_LINE} ${COIL_ENDS_LINE} ${COIL_STILL_LINE} ${COIL_TOTE_LINE}`}
      >
        <Link
          href={listingCoilPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The coil card
        </Link>
      </MallNotice>
    </div>
  );
}
