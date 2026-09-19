import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  HOOD_COOKIE_NAME,
  HOOD_JACKET_LINE,
  HOOD_NOTICE_TITLE,
  HOOD_SHELL_LINE,
  HOOD_STILL_LINE,
  HOOD_TABLE_LINE,
  HOOD_TOTE_LINE,
  isListingHoodOverlay,
  parseHoodListingIds,
} from "@/lib/listing-hood";
import { listingHoodPath } from "@/lib/paths";

/** PDP banner when this SKU is taped I-don’t-have-a-hood. Reads the cookie only. */
export async function ListingHoodNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseHoodListingIds(jar.get(HOOD_COOKIE_NAME)?.value);

  if (!isListingHoodOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-hood-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={HOOD_TABLE_LINE}
        title={HOOD_NOTICE_TITLE}
        body={`${HOOD_SHELL_LINE} ${HOOD_JACKET_LINE} ${HOOD_STILL_LINE} ${HOOD_TOTE_LINE}`}
      >
        <Link
          href={listingHoodPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The hood card
        </Link>
      </MallNotice>
    </div>
  );
}
