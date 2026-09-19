import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  SHIM_COOKIE_NAME,
  SHIM_LIGHTS_LINE,
  SHIM_NECK_LINE,
  SHIM_NOTICE_TITLE,
  SHIM_STILL_LINE,
  SHIM_TABLE_LINE,
  SHIM_TOTE_LINE,
  isListingShimOverlay,
  parseShimListingIds,
} from "@/lib/listing-shim";
import { listingShimPath } from "@/lib/paths";

/** PDP banner when this SKU is taped I-will-not-shim-it. Reads the cookie only. */
export async function ListingShimNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseShimListingIds(jar.get(SHIM_COOKIE_NAME)?.value);

  if (!isListingShimOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-shim-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={SHIM_TABLE_LINE}
        title={SHIM_NOTICE_TITLE}
        body={`${SHIM_NECK_LINE} ${SHIM_LIGHTS_LINE} ${SHIM_STILL_LINE} ${SHIM_TOTE_LINE}`}
      >
        <Link
          href={listingShimPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The shim card
        </Link>
      </MallNotice>
    </div>
  );
}
