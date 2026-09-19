import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { DEGAUSS_EMPTY_LINE, DEGAUSS_TABLE_LINE } from "@/lib/listing-degauss";
import { listingPath } from "@/lib/paths";

export function ListingDegaussEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-degauss-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Degauss not taped"
        title={DEGAUSS_EMPTY_LINE}
        body={`${DEGAUSS_TABLE_LINE} Tape it when walkers still want the cassette wiped. It does not drop the tote or mark it sold.`}
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
