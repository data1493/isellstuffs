import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  KERN_COOKIE_NAME,
  KERN_MAP_LINE,
  KERN_NOTICE_TITLE,
  KERN_STILL_LINE,
  KERN_TABLE_LINE,
  KERN_TOTE_LINE,
  KERN_WEIGHTS_LINE,
  isListingKernOverlay,
  parseKernListingIds,
} from "@/lib/listing-kern";
import { listingKernPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-kern-it. Reads the cookie only. */
export async function ListingKernNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseKernListingIds(jar.get(KERN_COOKIE_NAME)?.value);

  if (!isListingKernOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-kern-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={KERN_TABLE_LINE}
        title={KERN_NOTICE_TITLE}
        body={`${KERN_WEIGHTS_LINE} ${KERN_MAP_LINE} ${KERN_STILL_LINE} ${KERN_TOTE_LINE}`}
      >
        <Link
          href={listingKernPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The kern card
        </Link>
      </MallNotice>
    </div>
  );
}
