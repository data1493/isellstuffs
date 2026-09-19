import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  RUST_COOKIE_NAME,
  RUST_EGGS_LINE,
  RUST_METAL_LINE,
  RUST_NOTICE_TITLE,
  RUST_STILL_LINE,
  RUST_TABLE_LINE,
  RUST_TOTE_LINE,
  isListingRustOverlay,
  parseRustListingIds,
} from "@/lib/listing-rust";
import { listingRustPath } from "@/lib/paths";

/** PDP banner when this SKU is taped the-rust-stays. Does not change the tote. */
export async function ListingRustNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseRustListingIds(jar.get(RUST_COOKIE_NAME)?.value);

  if (!isListingRustOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-rust-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={RUST_TABLE_LINE}
        title={RUST_NOTICE_TITLE}
        body={`${RUST_METAL_LINE} ${RUST_EGGS_LINE} ${RUST_STILL_LINE} ${RUST_TOTE_LINE}`}
      >
        <Link
          href={listingRustPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The rust card
        </Link>
      </MallNotice>
    </div>
  );
}
