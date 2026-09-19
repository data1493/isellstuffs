import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { BPM_EMPTY_LINE, BPM_TABLE_LINE } from "@/lib/listing-bpm";
import { listingPath } from "@/lib/paths";

export function ListingBpmEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-bpm-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Open to a tempo map"
        title={BPM_EMPTY_LINE}
        body={`${BPM_TABLE_LINE} Tape it when walkers ask Beats for a 90-BPM stretch. It does not drop the tote or rewrite the file.`}
        actions={
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={listingPath(listingId)} />}
          >
            Back to the listing
          </Button>
        }
      />
    </div>
  );
}
