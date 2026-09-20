import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { LATTICE_EMPTY_LINE, LATTICE_TABLE_LINE } from "@/lib/listing-lattice";
import { listingPath } from "@/lib/paths";

export function ListingLatticeEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-lattice-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Lattice not taped"
        title={LATTICE_EMPTY_LINE}
        body={`${LATTICE_TABLE_LINE} Tape it when walkers still want a shop 3D lattice on the parking-lot looks. It does not drop the tote or rewrite the file.`}
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
