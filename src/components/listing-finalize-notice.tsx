import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  FINALIZE_COOKIE_NAME,
  FINALIZE_NOTICE_TITLE,
  FINALIZE_SCRATCHED_LINE,
  FINALIZE_SHARPIE_LINE,
  FINALIZE_STILL_LINE,
  FINALIZE_TABLE_LINE,
  FINALIZE_TOTE_LINE,
  isListingFinalizeOverlay,
  parseFinalizeListingIds,
} from "@/lib/listing-finalize";
import { listingFinalizePath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-finalize-it. Reads the cookie only. */
export async function ListingFinalizeNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseFinalizeListingIds(jar.get(FINALIZE_COOKIE_NAME)?.value);

  if (!isListingFinalizeOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-finalize-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={FINALIZE_TABLE_LINE}
        title={FINALIZE_NOTICE_TITLE}
        body={`${FINALIZE_SHARPIE_LINE} ${FINALIZE_SCRATCHED_LINE} ${FINALIZE_STILL_LINE} ${FINALIZE_TOTE_LINE}`}
      >
        <Link
          href={listingFinalizePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The finalize card
        </Link>
      </MallNotice>
    </div>
  );
}
