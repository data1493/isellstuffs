import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  DUMP_CART_LINE,
  DUMP_CELLS_LINE,
  DUMP_COOKIE_NAME,
  DUMP_NOTICE_TITLE,
  DUMP_PRESS_LINE,
  DUMP_STILL_LINE,
  DUMP_TABLE_LINE,
  DUMP_TOTE_LINE,
  isListingDumpOverlay,
  parseDumpListingIds,
} from "@/lib/listing-dump";
import { listingDumpPath } from "@/lib/paths";

/** PDP banner when this SKU is taped I-don't-dump. Does not change the tote. */
export async function ListingDumpNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseDumpListingIds(jar.get(DUMP_COOKIE_NAME)?.value);

  if (!isListingDumpOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-dump-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={DUMP_TABLE_LINE}
        title={DUMP_NOTICE_TITLE}
        body={`${DUMP_PRESS_LINE} ${DUMP_CELLS_LINE} ${DUMP_CART_LINE} ${DUMP_STILL_LINE} ${DUMP_TOTE_LINE}`}
      >
        <Link
          href={listingDumpPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The dump card
        </Link>
      </MallNotice>
    </div>
  );
}
