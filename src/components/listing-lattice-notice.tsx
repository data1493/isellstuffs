import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  LATTICE_COOKIE_NAME,
  LATTICE_FLUOR_LINE,
  LATTICE_LOT_LINE,
  LATTICE_NOTICE_TITLE,
  LATTICE_STILL_LINE,
  LATTICE_TABLE_LINE,
  LATTICE_TOTE_LINE,
  isListingLatticeOverlay,
  parseLatticeListingIds,
} from "@/lib/listing-lattice";
import { listingLatticePath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-lattice-them. Reads the cookie only. */
export async function ListingLatticeNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseLatticeListingIds(jar.get(LATTICE_COOKIE_NAME)?.value);

  if (!isListingLatticeOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-lattice-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={LATTICE_TABLE_LINE}
        title={LATTICE_NOTICE_TITLE}
        body={`${LATTICE_LOT_LINE} ${LATTICE_FLUOR_LINE} ${LATTICE_STILL_LINE} ${LATTICE_TOTE_LINE}`}
      >
        <Link
          href={listingLatticePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The lattice card
        </Link>
      </MallNotice>
    </div>
  );
}
