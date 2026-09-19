import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  CENTER_COOKIE_NAME,
  CENTER_NOTICE_TITLE,
  CENTER_STILL_LINE,
  CENTER_TABLE_LINE,
  CENTER_HOLE_LINE,
  CENTER_TOTE_LINE,
  isListingCenterOverlay,
  parseCenterListingIds,
} from "@/lib/listing-center";
import { listingCenterPath } from "@/lib/paths";

/** PDP banner when this SKU is taped I-will-not-center-it. Does not change the tote. */
export async function ListingCenterNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseCenterListingIds(jar.get(CENTER_COOKIE_NAME)?.value);

  if (!isListingCenterOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-center-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={CENTER_TABLE_LINE}
        title={CENTER_NOTICE_TITLE}
        body={`${CENTER_HOLE_LINE} ${CENTER_STILL_LINE} ${CENTER_TOTE_LINE}`}
      >
        <Link
          href={listingCenterPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The center card
        </Link>
      </MallNotice>
    </div>
  );
}
