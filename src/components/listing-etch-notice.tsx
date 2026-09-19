import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  ETCH_COOKIE_NAME,
  ETCH_GROOVE_LINE,
  ETCH_NOTICE_TITLE,
  ETCH_SIDE_LINE,
  ETCH_STILL_LINE,
  ETCH_TABLE_LINE,
  ETCH_TOTE_LINE,
  isListingEtchOverlay,
  parseEtchListingIds,
} from "@/lib/listing-etch";
import { listingEtchPath } from "@/lib/paths";

/** PDP banner when this SKU is taped I-will-not-read-the-runout. Reads the cookie only. */
export async function ListingEtchNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseEtchListingIds(jar.get(ETCH_COOKIE_NAME)?.value);

  if (!isListingEtchOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-etch-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={ETCH_TABLE_LINE}
        title={ETCH_NOTICE_TITLE}
        body={`${ETCH_GROOVE_LINE} ${ETCH_SIDE_LINE} ${ETCH_STILL_LINE} ${ETCH_TOTE_LINE}`}
      >
        <Link
          href={listingEtchPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The etch card
        </Link>
      </MallNotice>
    </div>
  );
}
