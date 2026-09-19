import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  SPEAKER_COOKIE_NAME,
  SPEAKER_FUSED_LINE,
  SPEAKER_LINE_LINE,
  SPEAKER_NOTICE_TITLE,
  SPEAKER_STILL_LINE,
  SPEAKER_TABLE_LINE,
  SPEAKER_TOTE_LINE,
  isListingSpeakerOverlay,
  parseSpeakerListingIds,
} from "@/lib/listing-speaker";
import { listingSpeakerPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-speaker-it. Reads the cookie only. */
export async function ListingSpeakerNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseSpeakerListingIds(jar.get(SPEAKER_COOKIE_NAME)?.value);

  if (!isListingSpeakerOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-speaker-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={SPEAKER_TABLE_LINE}
        title={SPEAKER_NOTICE_TITLE}
        body={`${SPEAKER_LINE_LINE} ${SPEAKER_FUSED_LINE} ${SPEAKER_STILL_LINE} ${SPEAKER_TOTE_LINE}`}
      >
        <Link
          href={listingSpeakerPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The speaker card
        </Link>
      </MallNotice>
    </div>
  );
}
