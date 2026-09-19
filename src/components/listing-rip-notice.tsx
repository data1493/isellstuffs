import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  RIP_COOKIE_NAME,
  RIP_HISS_LINE,
  RIP_SCAN_LINE,
  RIP_SONGS_LINE,
  RIP_STILL_LINE,
  RIP_TABLE_LINE,
  RIP_TAPE_LINE,
  RIP_TOTE_LINE,
  isListingRipOverlay,
  parseRipListingIds,
} from "@/lib/listing-rip";
import { listingRipPath } from "@/lib/paths";

/** PDP banner when this SKU is taped I-don't-rip. Does not change the tote. */
export async function ListingRipNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseRipListingIds(jar.get(RIP_COOKIE_NAME)?.value);

  if (!isListingRipOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-rip-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I don't rip"
        title={RIP_TABLE_LINE}
        body={`${RIP_HISS_LINE} ${RIP_SONGS_LINE} ${RIP_SCAN_LINE} ${RIP_TAPE_LINE} ${RIP_STILL_LINE} ${RIP_TOTE_LINE}`}
      >
        <Link
          href={listingRipPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The rip card
        </Link>
      </MallNotice>
    </div>
  );
}
