import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  VIBE_COOKIE_NAME,
  VIBE_COOKBOOK_LINE,
  VIBE_INCH_LINE,
  VIBE_SIZE_LINE,
  VIBE_STILL_LINE,
  VIBE_TABLE_LINE,
  VIBE_TOTE_LINE,
  isListingVibeOverlay,
  parseVibeListingIds,
} from "@/lib/listing-vibe";
import { listingVibePath } from "@/lib/paths";

/** PDP banner when measurements stay vibes. Does not change the tote. */
export async function ListingVibeNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseVibeListingIds(jar.get(VIBE_COOKIE_NAME)?.value);

  if (!isListingVibeOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-vibe-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Measurements are vibes"
        title={VIBE_TABLE_LINE}
        body={`${VIBE_COOKBOOK_LINE} ${VIBE_SIZE_LINE} ${VIBE_INCH_LINE} ${VIBE_STILL_LINE} ${VIBE_TOTE_LINE}`}
      >
        <Link
          href={listingVibePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The vibe card
        </Link>
      </MallNotice>
    </div>
  );
}
