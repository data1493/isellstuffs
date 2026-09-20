import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { STRAIN_EMPTY_LINE, STRAIN_TABLE_LINE } from "@/lib/listing-strain";
import { listingPath } from "@/lib/paths";

export function ListingStrainEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-strain-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Strain not taped"
        title={STRAIN_EMPTY_LINE}
        body={`${STRAIN_TABLE_LINE} Tape it when walkers still want the honest ends booted. It does not drop the tote or mark it sold.`}
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
