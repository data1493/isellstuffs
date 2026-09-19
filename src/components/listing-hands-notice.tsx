import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  HANDS_COOKIE_NAME,
  HANDS_LOOK_LINE,
  HANDS_PDF_LINE,
  HANDS_TOTE_LINE,
  HANDS_WALK_LINE,
  isListingHandsOverlay,
  parseHandsListingIds,
} from "@/lib/in-hands";
import { listingHandsPath } from "@/lib/paths";

/** PDP banner when this SKU is walking away. Does not write look or sold. */
export async function ListingHandsNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseHandsListingIds(jar.get(HANDS_COOKIE_NAME)?.value);

  if (!isListingHandsOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-hands-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="In someone's hands"
        title={HANDS_WALK_LINE}
        body={`${HANDS_TOTE_LINE} ${HANDS_LOOK_LINE} ${HANDS_PDF_LINE}`}
      >
        <Link
          href={listingHandsPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The hands card
        </Link>
      </MallNotice>
    </div>
  );
}
