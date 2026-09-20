import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { STILT_EMPTY_LINE, STILT_TABLE_LINE } from "@/lib/listing-stilt";
import { listingPath } from "@/lib/paths";

export function ListingStiltEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-stilt-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Stilt not taped"
        title={STILT_EMPTY_LINE}
        body={`${STILT_TABLE_LINE} Tape it when walkers still want shop kiln stilts. It does not drop the tote or mark it sold.`}
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
