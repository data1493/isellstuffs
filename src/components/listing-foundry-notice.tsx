import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  FOUNDRY_COOKIE_NAME,
  FOUNDRY_EULA_LINE,
  FOUNDRY_LICENSE_LINE,
  FOUNDRY_STICK_LINE,
  FOUNDRY_STILL_LINE,
  FOUNDRY_TABLE_LINE,
  FOUNDRY_TOTE_LINE,
  isListingFoundryOverlay,
  parseFoundryListingIds,
} from "@/lib/listing-foundry";
import { listingFoundryPath } from "@/lib/paths";

/** PDP banner when this file is one booth license. Does not change the tote. */
export async function ListingFoundryNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseFoundryListingIds(jar.get(FOUNDRY_COOKIE_NAME)?.value);

  if (!isListingFoundryOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-foundry-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Not a foundry seat"
        title={FOUNDRY_TABLE_LINE}
        body={`${FOUNDRY_LICENSE_LINE} ${FOUNDRY_STICK_LINE} ${FOUNDRY_EULA_LINE} ${FOUNDRY_STILL_LINE} ${FOUNDRY_TOTE_LINE}`}
      >
        <Link
          href={listingFoundryPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The foundry card
        </Link>
      </MallNotice>
    </div>
  );
}
