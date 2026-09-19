import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  HINGE_BOX_LINE,
  HINGE_CASES_LINE,
  HINGE_COOKIE_NAME,
  HINGE_NOT_LINE,
  HINGE_STILL_LINE,
  HINGE_TABLE_LINE,
  HINGE_TOTE_LINE,
  isListingHingeOverlay,
  parseHingeListingIds,
} from "@/lib/listing-hinge";
import { listingHingePath } from "@/lib/paths";

/** PDP banner when this SKU is taped hinge-gone. Does not change the tote. */
export async function ListingHingeNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseHingeListingIds(jar.get(HINGE_COOKIE_NAME)?.value);

  if (!isListingHingeOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-hinge-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="The hinge stays gone"
        title={HINGE_TABLE_LINE}
        body={`${HINGE_BOX_LINE} ${HINGE_STILL_LINE} ${HINGE_TOTE_LINE} ${HINGE_CASES_LINE} ${HINGE_NOT_LINE}`}
      >
        <Link
          href={listingHingePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The hinge card
        </Link>
      </MallNotice>
    </div>
  );
}
