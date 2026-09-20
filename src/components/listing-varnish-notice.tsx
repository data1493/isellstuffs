import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  VARNISH_COOKIE_NAME,
  VARNISH_NOTICE_TITLE,
  VARNISH_PAGE_LINE,
  VARNISH_RULE_LINE,
  VARNISH_STILL_LINE,
  VARNISH_TABLE_LINE,
  VARNISH_TOTE_LINE,
  isListingVarnishOverlay,
  parseVarnishListingIds,
} from "@/lib/listing-varnish";
import { listingVarnishPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-varnish-it. Reads the cookie only. */
export async function ListingVarnishNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseVarnishListingIds(jar.get(VARNISH_COOKIE_NAME)?.value);

  if (!isListingVarnishOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-varnish-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={VARNISH_TABLE_LINE}
        title={VARNISH_NOTICE_TITLE}
        body={`${VARNISH_PAGE_LINE} ${VARNISH_RULE_LINE} ${VARNISH_STILL_LINE} ${VARNISH_TOTE_LINE}`}
      >
        <Link
          href={listingVarnishPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The varnish card
        </Link>
      </MallNotice>
    </div>
  );
}
