import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  CRACK_BASE_LINE,
  CRACK_COOKIE_NAME,
  CRACK_CORD_LINE,
  CRACK_STILL_LINE,
  CRACK_TABLE_LINE,
  CRACK_TOTE_LINE,
  isListingCrackOverlay,
  parseCrackListingIds,
} from "@/lib/listing-crack";
import { listingCrackPath } from "@/lib/paths";

/** PDP banner when this SKU is taped the-crack-stays. Does not change the tote. */
export async function ListingCrackNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseCrackListingIds(jar.get(CRACK_COOKIE_NAME)?.value);

  if (!isListingCrackOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-crack-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="The crack stays"
        title={CRACK_TABLE_LINE}
        body={`${CRACK_CORD_LINE} ${CRACK_BASE_LINE} ${CRACK_STILL_LINE} ${CRACK_TOTE_LINE}`}
      >
        <Link
          href={listingCrackPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The crack card
        </Link>
      </MallNotice>
    </div>
  );
}
