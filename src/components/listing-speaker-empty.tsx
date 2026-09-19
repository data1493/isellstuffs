import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { SPEAKER_EMPTY_LINE, SPEAKER_TABLE_LINE } from "@/lib/listing-speaker";
import { listingPath } from "@/lib/paths";

export function ListingSpeakerEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-speaker-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Speaker not taped"
        title={SPEAKER_EMPTY_LINE}
        body={`${SPEAKER_TABLE_LINE} Tape it when walkers still want Tetris to have sound. It does not drop the tote or mark it sold.`}
        actions={
          <Button
            variant="outline"
            className="h-11 w-full rounded-full px-5 sm:w-auto"
            render={<Link href={listingPath(listingId)} />}
          >
            Back to the listing
          </Button>
        }
      />
    </div>
  );
}
