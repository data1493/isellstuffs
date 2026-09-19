import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  LINK_BRICK_LINE,
  LINK_COOKIE_NAME,
  LINK_NOTICE_TITLE,
  LINK_STILL_LINE,
  LINK_TABLE_LINE,
  LINK_TOTE_LINE,
  isListingLinkOverlay,
  parseLinkListingIds,
} from "@/lib/listing-link";
import { listingLinkPath } from "@/lib/paths";

/** PDP banner when this SKU is taped I-don't-have-a-link. Does not change the tote. */
export async function ListingLinkNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseLinkListingIds(jar.get(LINK_COOKIE_NAME)?.value);

  if (!isListingLinkOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-link-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={LINK_TABLE_LINE}
        title={LINK_NOTICE_TITLE}
        body={`${LINK_BRICK_LINE} ${LINK_STILL_LINE} ${LINK_TOTE_LINE}`}
      >
        <Link
          href={listingLinkPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The link card
        </Link>
      </MallNotice>
    </div>
  );
}
