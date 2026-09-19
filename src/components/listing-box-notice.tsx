import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  BOX_COOKIE_NAME,
  BOX_CORD_LINE,
  BOX_SHADE_LINE,
  BOX_STILL_LINE,
  BOX_TABLE_LINE,
  BOX_TOTE_LINE,
  isListingBoxOverlay,
  parseBoxListingIds,
} from "@/lib/listing-box";
import { listingBoxPath } from "@/lib/paths";

/** PDP banner when this SKU is taped shade-stays-in-the-box. Does not change the tote. */
export async function ListingBoxNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseBoxListingIds(jar.get(BOX_COOKIE_NAME)?.value);

  if (!isListingBoxOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-box-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="The shade stays in the box"
        title={BOX_TABLE_LINE}
        body={`${BOX_CORD_LINE} ${BOX_SHADE_LINE} ${BOX_STILL_LINE} ${BOX_TOTE_LINE}`}
      >
        <Link
          href={listingBoxPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The shade-box card
        </Link>
      </MallNotice>
    </div>
  );
}
