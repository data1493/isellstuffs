import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { PLEAT_EMPTY_LINE, PLEAT_TABLE_LINE } from "@/lib/listing-pleat";
import { listingPath } from "@/lib/paths";

export function ListingPleatEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-pleat-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Pleat not taped"
        title={PLEAT_EMPTY_LINE}
        body={`${PLEAT_TABLE_LINE} Tape it when walkers still want the front folded. It does not drop the tote or mark it sold.`}
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
