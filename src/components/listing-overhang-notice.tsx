import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  OVERHANG_COOKIE_NAME,
  OVERHANG_NOTICE_TITLE,
  OVERHANG_SKIP_LINE,
  OVERHANG_STILL_LINE,
  OVERHANG_TABLE_LINE,
  OVERHANG_TOTE_LINE,
  OVERHANG_UNNAMED_LINE,
  isListingOverhangOverlay,
  parseOverhangListingIds,
} from "@/lib/listing-overhang";
import { listingOverhangPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-overhang-it. Reads the cookie only. */
export async function ListingOverhangNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseOverhangListingIds(jar.get(OVERHANG_COOKIE_NAME)?.value);

  if (!isListingOverhangOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-overhang-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={OVERHANG_TABLE_LINE}
        title={OVERHANG_NOTICE_TITLE}
        body={`${OVERHANG_SKIP_LINE} ${OVERHANG_UNNAMED_LINE} ${OVERHANG_STILL_LINE} ${OVERHANG_TOTE_LINE}`}
      >
        <Link
          href={listingOverhangPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The overhang card
        </Link>
      </MallNotice>
    </div>
  );
}
