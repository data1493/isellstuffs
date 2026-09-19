import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  VERSO_COOKIE_NAME,
  VERSO_NOTICE_TITLE,
  VERSO_STAYS_LINE,
  VERSO_STILL_LINE,
  VERSO_TABLE_LINE,
  VERSO_TOTE_LINE,
  VERSO_WALK_LINE,
  isListingVersoOverlay,
  parseVersoListingIds,
} from "@/lib/listing-verso";
import { listingVersoPath } from "@/lib/paths";

/** PDP banner when this file stays one page. Does not change the tote. */
export async function ListingVersoNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseVersoListingIds(jar.get(VERSO_COOKIE_NAME)?.value);

  if (!isListingVersoOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-verso-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={VERSO_TABLE_LINE}
        title={VERSO_NOTICE_TITLE}
        body={`${VERSO_STAYS_LINE} ${VERSO_WALK_LINE} ${VERSO_STILL_LINE} ${VERSO_TOTE_LINE}`}
      >
        <Link
          href={listingVersoPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The verso card
        </Link>
      </MallNotice>
    </div>
  );
}
