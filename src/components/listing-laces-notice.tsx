import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  LACES_COOKIE_NAME,
  LACES_HOME_LINE,
  LACES_STILL_LINE,
  LACES_TABLE_LINE,
  LACES_TOTE_LINE,
  LACES_VAN_LINE,
  listingLacesFor,
  parseListingLaces,
} from "@/lib/listing-laces";
import { listingLacesPath } from "@/lib/paths";

/** PDP banner when this SKU kept the good laces. Does not change the tote. */
export async function ListingLacesNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const map = parseListingLaces(jar.get(LACES_COOKIE_NAME)?.value);
  const current = listingLacesFor(listingId, map);

  if (!current) {
    return null;
  }

  return (
    <div data-laces-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={LACES_TABLE_LINE}
        title={`${LACES_TABLE_LINE} ${current.note}`}
        body={`${LACES_HOME_LINE} ${LACES_STILL_LINE} ${LACES_TOTE_LINE} ${LACES_VAN_LINE}`}
      >
        <Link
          href={listingLacesPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The laces card
        </Link>
      </MallNotice>
    </div>
  );
}
