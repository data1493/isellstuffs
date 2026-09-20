import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  GEM_COOKIE_NAME,
  GEM_FLEX_LINE,
  GEM_LACES_LINE,
  GEM_NOTICE_TITLE,
  GEM_STILL_LINE,
  GEM_TABLE_LINE,
  GEM_TOTE_LINE,
  isListingGemOverlay,
  parseGemListingIds,
} from "@/lib/listing-gem";
import { listingGemPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-gem-them. Reads the cookie only. */
export async function ListingGemNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseGemListingIds(jar.get(GEM_COOKIE_NAME)?.value);

  if (!isListingGemOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-gem-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={GEM_TABLE_LINE}
        title={GEM_NOTICE_TITLE}
        body={`${GEM_FLEX_LINE} ${GEM_LACES_LINE} ${GEM_STILL_LINE} ${GEM_TOTE_LINE}`}
      >
        <Link
          href={listingGemPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The gem card
        </Link>
      </MallNotice>
    </div>
  );
}
