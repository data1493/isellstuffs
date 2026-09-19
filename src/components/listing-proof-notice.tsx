import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  PROOF_CARDS_LINE,
  PROOF_COOKIE_NAME,
  PROOF_NOTICE_TITLE,
  PROOF_STILL_LINE,
  PROOF_TABLE_LINE,
  PROOF_TOTE_LINE,
  PROOF_VIBE_LINE,
  isListingProofOverlay,
  parseProofListingIds,
} from "@/lib/listing-proof";
import { listingProofPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-proof-them. Reads the cookie only. */
export async function ListingProofNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseProofListingIds(jar.get(PROOF_COOKIE_NAME)?.value);

  if (!isListingProofOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-proof-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={PROOF_TABLE_LINE}
        title={PROOF_NOTICE_TITLE}
        body={`${PROOF_CARDS_LINE} ${PROOF_VIBE_LINE} ${PROOF_STILL_LINE} ${PROOF_TOTE_LINE}`}
      >
        <Link
          href={listingProofPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The proof card
        </Link>
      </MallNotice>
    </div>
  );
}
