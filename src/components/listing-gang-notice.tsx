import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  GANG_CARDS_LINE,
  GANG_COOKIE_NAME,
  GANG_GREASE_LINE,
  GANG_NOTICE_TITLE,
  GANG_STILL_LINE,
  GANG_TABLE_LINE,
  GANG_TOTE_LINE,
  isListingGangOverlay,
  parseGangListingIds,
} from "@/lib/listing-gang";
import { listingGangPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-gang-them. Reads the cookie only. */
export async function ListingGangNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseGangListingIds(jar.get(GANG_COOKIE_NAME)?.value);

  if (!isListingGangOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-gang-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={GANG_TABLE_LINE}
        title={GANG_NOTICE_TITLE}
        body={`${GANG_CARDS_LINE} ${GANG_GREASE_LINE} ${GANG_STILL_LINE} ${GANG_TOTE_LINE}`}
      >
        <Link
          href={listingGangPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The gang card
        </Link>
      </MallNotice>
    </div>
  );
}
