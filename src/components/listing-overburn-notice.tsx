import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  OVERBURN_COOKIE_NAME,
  OVERBURN_NOTICE_TITLE,
  OVERBURN_SCRATCHED_LINE,
  OVERBURN_SHARPIE_LINE,
  OVERBURN_STILL_LINE,
  OVERBURN_TABLE_LINE,
  OVERBURN_TOTE_LINE,
  isListingOverburnOverlay,
  parseOverburnListingIds,
} from "@/lib/listing-overburn";
import { listingOverburnPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-overburn-it. Reads the cookie only. */
export async function ListingOverburnNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseOverburnListingIds(jar.get(OVERBURN_COOKIE_NAME)?.value);

  if (!isListingOverburnOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-overburn-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={OVERBURN_TABLE_LINE}
        title={OVERBURN_NOTICE_TITLE}
        body={`${OVERBURN_SHARPIE_LINE} ${OVERBURN_SCRATCHED_LINE} ${OVERBURN_STILL_LINE} ${OVERBURN_TOTE_LINE}`}
      >
        <Link
          href={listingOverburnPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The overburn card
        </Link>
      </MallNotice>
    </div>
  );
}
