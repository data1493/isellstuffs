import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { COIL_EMPTY_LINE, COIL_TABLE_LINE } from "@/lib/listing-coil";
import { listingPath } from "@/lib/paths";

export function ListingCoilEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-coil-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Coil not taped"
        title={COIL_EMPTY_LINE}
        body={`${COIL_TABLE_LINE} Tape it when walkers still want the drawer coiled. It does not drop the tote or mark it sold.`}
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
