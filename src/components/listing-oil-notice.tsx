import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  OIL_COOKIE_NAME,
  OIL_HINGE_LINE,
  OIL_SQUEAK_LINE,
  OIL_STILL_LINE,
  OIL_TABLE_LINE,
  OIL_TOTE_LINE,
  isListingOilOverlay,
  parseOilListingIds,
} from "@/lib/listing-oil";
import { listingOilPath } from "@/lib/paths";

/** PDP banner when this SKU is taped needs-a-drop-of-oil. Does not change the tote. */
export async function ListingOilNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseOilListingIds(jar.get(OIL_COOKIE_NAME)?.value);

  if (!isListingOilOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-oil-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Needs a drop of oil"
        title={OIL_TABLE_LINE}
        body={`${OIL_HINGE_LINE} ${OIL_SQUEAK_LINE} ${OIL_STILL_LINE} ${OIL_TOTE_LINE}`}
      >
        <Link
          href={listingOilPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The oil card
        </Link>
      </MallNotice>
    </div>
  );
}
