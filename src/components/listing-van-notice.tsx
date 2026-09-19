import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { listingVanPath } from "@/lib/paths";
import {
  VAN_COOKIE_NAME,
  VAN_GARAGE_LINE,
  VAN_LOOK_LINE,
  VAN_TABLE_LINE,
  VAN_TOTE_LINE,
  isListingVanOverlay,
  parseVanListingIds,
} from "@/lib/van-restock";

/** PDP banner when this SKU has more in the van. Does not change the tote. */
export async function ListingVanNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseVanListingIds(jar.get(VAN_COOKIE_NAME)?.value);

  if (!isListingVanOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-van-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="More in the van"
        title={VAN_TABLE_LINE}
        body={`${VAN_TOTE_LINE} ${VAN_GARAGE_LINE} ${VAN_LOOK_LINE}`}
      >
        <Link
          href={listingVanPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The van note
        </Link>
      </MallNotice>
    </div>
  );
}
