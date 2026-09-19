import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { BEEP_EMPTY_LINE, BEEP_TABLE_LINE } from "@/lib/listing-beep";
import { listingPath } from "@/lib/paths";

export function ListingBeepEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-beep-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Beep not taped"
        title={BEEP_EMPTY_LINE}
        body={`${BEEP_TABLE_LINE} Tape it when walkers still want a continuity beep. It does not drop the tote or mark it sold.`}
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
