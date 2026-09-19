import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  VG_COOKIE_NAME,
  VG_NOTICE_TITLE,
  VG_STILL_LINE,
  VG_TABLE_LINE,
  VG_TOTE_LINE,
  isListingVgOverlay,
  parseVgListingIds,
} from "@/lib/listing-vg";
import { listingVgPath } from "@/lib/paths";

/** PDP banner when this SKU is taped I-will-not-VG. Does not change the tote. */
export async function ListingVgNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseVgListingIds(jar.get(VG_COOKIE_NAME)?.value);

  if (!isListingVgOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-vg-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={VG_TABLE_LINE}
        title={VG_NOTICE_TITLE}
        body={`${VG_STILL_LINE} ${VG_TOTE_LINE}`}
      >
        <Link
          href={listingVgPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The VG card
        </Link>
      </MallNotice>
    </div>
  );
}
