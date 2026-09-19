import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  CORD_COOKIE_NAME,
  CORD_FACTORY_LINE,
  CORD_LAMP_LINE,
  CORD_SHELL_LINE,
  CORD_STILL_LINE,
  CORD_TABLE_LINE,
  CORD_TOTE_LINE,
  isListingCordOverlay,
  parseCordListingIds,
} from "@/lib/listing-cord";
import { listingCordPath } from "@/lib/paths";

/** PDP banner when this SKU is already rewired. Does not change the tote. */
export async function ListingCordNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseCordListingIds(jar.get(CORD_COOKIE_NAME)?.value);

  if (!isListingCordOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-cord-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Rewired"
        title={CORD_TABLE_LINE}
        body={`${CORD_LAMP_LINE} ${CORD_FACTORY_LINE} ${CORD_SHELL_LINE} ${CORD_STILL_LINE} ${CORD_TOTE_LINE}`}
      >
        <Link
          href={listingCordPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The rewire card
        </Link>
      </MallNotice>
    </div>
  );
}
