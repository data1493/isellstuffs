import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  HANDLE_CHIP_LINE,
  HANDLE_COFFEE_LINE,
  HANDLE_COOKIE_NAME,
  HANDLE_NOTICE_TITLE,
  HANDLE_STILL_LINE,
  HANDLE_TABLE_LINE,
  HANDLE_TOTE_LINE,
  isListingHandleOverlay,
  parseHandleListingIds,
} from "@/lib/listing-handle";
import { listingHandlePath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-handle-it. Reads the cookie only. */
export async function ListingHandleNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseHandleListingIds(jar.get(HANDLE_COOKIE_NAME)?.value);

  if (!isListingHandleOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-handle-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={HANDLE_TABLE_LINE}
        title={HANDLE_NOTICE_TITLE}
        body={`${HANDLE_CHIP_LINE} ${HANDLE_COFFEE_LINE} ${HANDLE_STILL_LINE} ${HANDLE_TOTE_LINE}`}
      >
        <Link
          href={listingHandlePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The handle card
        </Link>
      </MallNotice>
    </div>
  );
}
