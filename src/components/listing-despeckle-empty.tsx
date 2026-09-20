import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { DESPECKLE_EMPTY_LINE, DESPECKLE_TABLE_LINE } from "@/lib/listing-despeckle";
import { listingPath } from "@/lib/paths";

export function ListingDespeckleEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-despeckle-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Despeckle not taped"
        title={DESPECKLE_EMPTY_LINE}
        body={`${DESPECKLE_TABLE_LINE} Tape it when walkers still want the flecks healed. It does not drop the tote or rewrite the file. Heal the flecks, not a login.`}
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
