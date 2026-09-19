import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  CUBE_COOKIE_NAME,
  CUBE_LOOKS_LINE,
  CUBE_NOTICE_TITLE,
  CUBE_PACK_LINE,
  CUBE_STILL_LINE,
  CUBE_TABLE_LINE,
  CUBE_TOTE_LINE,
  isListingCubeOverlay,
  parseCubeListingIds,
} from "@/lib/listing-cube";
import { listingCubePath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-cube-them. Reads the cookie only. */
export async function ListingCubeNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseCubeListingIds(jar.get(CUBE_COOKIE_NAME)?.value);

  if (!isListingCubeOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-cube-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={CUBE_TABLE_LINE}
        title={CUBE_NOTICE_TITLE}
        body={`${CUBE_LOOKS_LINE} ${CUBE_PACK_LINE} ${CUBE_STILL_LINE} ${CUBE_TOTE_LINE}`}
      >
        <Link
          href={listingCubePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The cube card
        </Link>
      </MallNotice>
    </div>
  );
}
