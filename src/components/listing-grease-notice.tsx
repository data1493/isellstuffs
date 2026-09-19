import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  GREASE_COOKIE_NAME,
  GREASE_NOTICE_TITLE,
  GREASE_READABLE_LINE,
  GREASE_STILL_LINE,
  GREASE_TABLE_LINE,
  GREASE_TOTE_LINE,
  isListingGreaseOverlay,
  parseGreaseListingIds,
} from "@/lib/listing-grease";
import { listingGreasePath } from "@/lib/paths";

/** PDP banner when this file keeps the grease. Reads the cookie only. */
export async function ListingGreaseNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseGreaseListingIds(jar.get(GREASE_COOKIE_NAME)?.value);

  if (!isListingGreaseOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-grease-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={GREASE_TABLE_LINE}
        title={GREASE_NOTICE_TITLE}
        body={`${GREASE_READABLE_LINE} ${GREASE_STILL_LINE} ${GREASE_TOTE_LINE}`}
      >
        <Link
          href={listingGreasePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The grease card
        </Link>
      </MallNotice>
    </div>
  );
}
