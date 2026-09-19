import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { GROMMET_EMPTY_LINE, GROMMET_TABLE_LINE } from "@/lib/listing-grommet";
import { listingPath } from "@/lib/paths";

export function ListingGrommetEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-grommet-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Grommet not taped"
        title={GROMMET_EMPTY_LINE}
        body={`${GROMMET_TABLE_LINE} Tape it when walkers still want the shade set. It does not drop the tote or mark it sold.`}
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
