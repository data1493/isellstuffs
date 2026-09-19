import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  CELLS_AA_LINE,
  CELLS_COOKIE_NAME,
  CELLS_PARTS_LINE,
  CELLS_STILL_LINE,
  CELLS_TABLE_LINE,
  CELLS_TOTE_LINE,
  isListingCellsOverlay,
  parseCellsListingIds,
} from "@/lib/listing-cells";
import { listingCellsPath } from "@/lib/paths";

/** PDP banner when this SKU is taped batteries-not-included. Does not change the tote. */
export async function ListingCellsNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseCellsListingIds(jar.get(CELLS_COOKIE_NAME)?.value);

  if (!isListingCellsOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-cells-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Batteries not included"
        title={CELLS_TABLE_LINE}
        body={`${CELLS_AA_LINE} ${CELLS_STILL_LINE} ${CELLS_TOTE_LINE} ${CELLS_PARTS_LINE}`}
      >
        <Link
          href={listingCellsPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The cells card
        </Link>
      </MallNotice>
    </div>
  );
}
