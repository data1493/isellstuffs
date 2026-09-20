import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  TRAP_COOKIE_NAME,
  TRAP_NOTICE_TITLE,
  TRAP_PDF_LINE,
  TRAP_PRINT_LINE,
  TRAP_STILL_LINE,
  TRAP_TABLE_LINE,
  TRAP_TOTE_LINE,
  isListingTrapOverlay,
  parseTrapListingIds,
} from "@/lib/listing-trap";
import { listingTrapPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-trap-it. Reads the cookie only. */
export async function ListingTrapNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseTrapListingIds(jar.get(TRAP_COOKIE_NAME)?.value);

  if (!isListingTrapOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-trap-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={TRAP_TABLE_LINE}
        title={TRAP_NOTICE_TITLE}
        body={`${TRAP_PDF_LINE} ${TRAP_PRINT_LINE} ${TRAP_STILL_LINE} ${TRAP_TOTE_LINE}`}
      >
        <Link
          href={listingTrapPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The trap card
        </Link>
      </MallNotice>
    </div>
  );
}
