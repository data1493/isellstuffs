import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  TINES_COOKIE_NAME,
  TINES_METAL_LINE,
  TINES_NOTICE_TITLE,
  TINES_SPLAY_LINE,
  TINES_STILL_LINE,
  TINES_TABLE_LINE,
  TINES_TOTE_LINE,
  isListingTinesOverlay,
  parseTinesListingIds,
} from "@/lib/listing-tines";
import { listingTinesPath } from "@/lib/paths";

/** PDP banner when this SKU is taped I-will-not-replace-a-tine. Does not change the tote. */
export async function ListingTinesNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseTinesListingIds(jar.get(TINES_COOKIE_NAME)?.value);

  if (!isListingTinesOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-tines-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={TINES_TABLE_LINE}
        title={TINES_NOTICE_TITLE}
        body={`${TINES_SPLAY_LINE} ${TINES_METAL_LINE} ${TINES_STILL_LINE} ${TINES_TOTE_LINE}`}
      >
        <Link
          href={listingTinesPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The tines card
        </Link>
      </MallNotice>
    </div>
  );
}
