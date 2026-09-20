import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { NABS_EMPTY_LINE, NABS_TABLE_LINE } from "@/lib/listing-nabs";
import { listingPath } from "@/lib/paths";

export function ListingNabsEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-nabs-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Nabs not taped"
        title={NABS_EMPTY_LINE}
        body={`${NABS_TABLE_LINE} Tape it when walkers still want shop NAB. It does not drop the tote or mark it sold.`}
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
