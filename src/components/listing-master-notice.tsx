import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  MASTER_BURN_LINE,
  MASTER_COOKIE_NAME,
  MASTER_NOTICE_TITLE,
  MASTER_STILL_LINE,
  MASTER_TABLE_LINE,
  MASTER_TOTE_LINE,
  isListingMasterOverlay,
  parseMasterListingIds,
} from "@/lib/listing-master";
import { listingMasterPath } from "@/lib/paths";

/** PDP banner when this SKU is taped I-don't-have-the-master. Does not change the tote. */
export async function ListingMasterNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseMasterListingIds(jar.get(MASTER_COOKIE_NAME)?.value);

  if (!isListingMasterOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-master-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={MASTER_TABLE_LINE}
        title={MASTER_NOTICE_TITLE}
        body={`${MASTER_BURN_LINE} ${MASTER_STILL_LINE} ${MASTER_TOTE_LINE}`}
      >
        <Link
          href={listingMasterPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The master card
        </Link>
      </MallNotice>
    </div>
  );
}
