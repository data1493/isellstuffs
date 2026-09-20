import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  VTA_COOKIE_NAME,
  VTA_NOTICE_TITLE,
  VTA_SKIP_LINE,
  VTA_STILL_LINE,
  VTA_TABLE_LINE,
  VTA_TOTE_LINE,
  VTA_UNNAMED_LINE,
  isListingVtaOverlay,
  parseVtaListingIds,
} from "@/lib/listing-vta";
import { listingVtaPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-vta-it. Reads the cookie only. */
export async function ListingVtaNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseVtaListingIds(jar.get(VTA_COOKIE_NAME)?.value);

  if (!isListingVtaOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-vta-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={VTA_TABLE_LINE}
        title={VTA_NOTICE_TITLE}
        body={`${VTA_SKIP_LINE} ${VTA_UNNAMED_LINE} ${VTA_STILL_LINE} ${VTA_TOTE_LINE}`}
      >
        <Link
          href={listingVtaPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The vta card
        </Link>
      </MallNotice>
    </div>
  );
}
