import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  EBDT_BOLD_LINE,
  EBDT_COOKIE_NAME,
  EBDT_NOTICE_TITLE,
  EBDT_STILL_LINE,
  EBDT_TABLE_LINE,
  EBDT_TOTE_LINE,
  EBDT_WEIGHTS_LINE,
  isListingEbdtOverlay,
  parseEbdtListingIds,
} from "@/lib/listing-ebdt";
import { listingEbdtPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-ebdt-it. Reads the cookie only. */
export async function ListingEbdtNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseEbdtListingIds(jar.get(EBDT_COOKIE_NAME)?.value);

  if (!isListingEbdtOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-ebdt-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={EBDT_TABLE_LINE}
        title={EBDT_NOTICE_TITLE}
        body={`${EBDT_WEIGHTS_LINE} ${EBDT_BOLD_LINE} ${EBDT_STILL_LINE} ${EBDT_TOTE_LINE}`}
      >
        <Link
          href={listingEbdtPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The ebdt card
        </Link>
      </MallNotice>
    </div>
  );
}
