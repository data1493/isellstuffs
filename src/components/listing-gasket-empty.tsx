import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { GASKET_EMPTY_LINE, GASKET_TABLE_LINE } from "@/lib/listing-gasket";
import { listingPath } from "@/lib/paths";

export function ListingGasketEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-gasket-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Gasket not taped"
        title={GASKET_EMPTY_LINE}
        body={`${GASKET_TABLE_LINE} Tape it when walkers still want a seal. It does not drop the tote or mark it sold.`}
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
