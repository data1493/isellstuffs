import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  VACUUM_BAG_LINE,
  VACUUM_COOKIE_NAME,
  VACUUM_NOTICE_TITLE,
  VACUUM_SKIP_LINE,
  VACUUM_STILL_LINE,
  VACUUM_TABLE_LINE,
  VACUUM_TOTE_LINE,
  isListingVacuumOverlay,
  parseVacuumListingIds,
} from "@/lib/listing-vacuum";
import { listingVacuumPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-vacuum-it. Reads the cookie only. */
export async function ListingVacuumNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseVacuumListingIds(jar.get(VACUUM_COOKIE_NAME)?.value);

  if (!isListingVacuumOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-vacuum-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={VACUUM_TABLE_LINE}
        title={VACUUM_NOTICE_TITLE}
        body={`${VACUUM_SKIP_LINE} ${VACUUM_BAG_LINE} ${VACUUM_STILL_LINE} ${VACUUM_TOTE_LINE}`}
      >
        <Link
          href={listingVacuumPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The vacuum card
        </Link>
      </MallNotice>
    </div>
  );
}
