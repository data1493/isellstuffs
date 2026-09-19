import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  CAP_COOKIE_NAME,
  CAP_NOTICE_TITLE,
  CAP_OPEN_LINE,
  CAP_STILL_LINE,
  CAP_TABLE_LINE,
  CAP_TOTE_LINE,
  isListingCapOverlay,
  parseCapListingIds,
} from "@/lib/listing-cap";
import { listingCapPath } from "@/lib/paths";

/** PDP banner when this SKU is taped I-don't-have-a-cap. Does not change the tote. */
export async function ListingCapNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseCapListingIds(jar.get(CAP_COOKIE_NAME)?.value);

  if (!isListingCapOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-cap-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={CAP_TABLE_LINE}
        title={CAP_NOTICE_TITLE}
        body={`${CAP_OPEN_LINE} ${CAP_STILL_LINE} ${CAP_TOTE_LINE}`}
      >
        <Link
          href={listingCapPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The cap card
        </Link>
      </MallNotice>
    </div>
  );
}
