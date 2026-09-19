import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  STRAP_BOX_LINE,
  STRAP_COOKIE_NAME,
  STRAP_REMOTE_LINE,
  STRAP_STILL_LINE,
  STRAP_TABLE_LINE,
  STRAP_TOTE_LINE,
  STRAP_VAN_LINE,
  isListingStrapOverlay,
  parseStrapListingIds,
} from "@/lib/listing-strap";
import { listingStrapPath } from "@/lib/paths";

/** PDP banner when this SKU is taped strap-walked. Does not change the tote. */
export async function ListingStrapNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseStrapListingIds(jar.get(STRAP_COOKIE_NAME)?.value);

  if (!isListingStrapOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-strap-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="The strap walked"
        title={STRAP_TABLE_LINE}
        body={`${STRAP_BOX_LINE} ${STRAP_STILL_LINE} ${STRAP_TOTE_LINE} ${STRAP_REMOTE_LINE} ${STRAP_VAN_LINE}`}
      >
        <Link
          href={listingStrapPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The strap card
        </Link>
      </MallNotice>
    </div>
  );
}
