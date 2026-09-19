import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { LABEL_EMPTY_LINE, LABEL_TABLE_LINE } from "@/lib/listing-label";
import { listingPath } from "@/lib/paths";

export function ListingLabelEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-label-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Label not taped"
        title={LABEL_EMPTY_LINE}
        body={`${LABEL_TABLE_LINE} Tape it when walkers still want HDMI on the tape. It does not drop the tote or mark it sold.`}
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
