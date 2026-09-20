import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { ETALON_EMPTY_LINE, ETALON_TABLE_LINE } from "@/lib/listing-etalon";
import { listingPath } from "@/lib/paths";

export function ListingEtalonEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-etalon-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Etalon not taped"
        title={ETALON_EMPTY_LINE}
        body={`${ETALON_TABLE_LINE} Tape it when walkers still want shop Fabry-Pérot etalon. It does not drop the tote or mark it sold.`}
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
