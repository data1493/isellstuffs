import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { SINE_EMPTY_LINE, SINE_TABLE_LINE } from "@/lib/listing-sine";
import { listingPath } from "@/lib/paths";

export function ListingSineEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-sine-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Sine not taped"
        title={SINE_EMPTY_LINE}
        body={`${SINE_TABLE_LINE} Tape it when walkers still want a shop sine plate. It does not drop the tote or mark it sold.`}
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
