import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { KNOB_EMPTY_LINE, KNOB_TABLE_LINE } from "@/lib/listing-knob";
import { listingPath } from "@/lib/paths";

export function ListingKnobEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-knob-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Screw holds"
        title={KNOB_EMPTY_LINE}
        body={`${KNOB_TABLE_LINE} Tape it when the pot-lid knob stays loose. It does not drop the tote or mark it sold.`}
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
