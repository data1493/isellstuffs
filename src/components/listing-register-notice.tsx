import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  REGISTER_CARDS_LINE,
  REGISTER_COOKIE_NAME,
  REGISTER_NOTICE_TITLE,
  REGISTER_STILL_LINE,
  REGISTER_TABLE_LINE,
  REGISTER_TOTE_LINE,
  REGISTER_VIBE_LINE,
  isListingRegisterOverlay,
  parseRegisterListingIds,
} from "@/lib/listing-register";
import { listingRegisterPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-register-it. Reads the cookie only. */
export async function ListingRegisterNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseRegisterListingIds(jar.get(REGISTER_COOKIE_NAME)?.value);

  if (!isListingRegisterOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-register-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={REGISTER_TABLE_LINE}
        title={REGISTER_NOTICE_TITLE}
        body={`${REGISTER_CARDS_LINE} ${REGISTER_VIBE_LINE} ${REGISTER_STILL_LINE} ${REGISTER_TOTE_LINE}`}
      >
        <Link
          href={listingRegisterPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The register card
        </Link>
      </MallNotice>
    </div>
  );
}
