import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { GRAIN_EMPTY_LINE, GRAIN_TABLE_LINE } from "@/lib/listing-grain";
import { listingPath } from "@/lib/paths";

export function ListingGrainEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-grain-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Grain not taped"
        title={GRAIN_EMPTY_LINE}
        body={`${GRAIN_TABLE_LINE} Tape it when walkers still want 16mm on the looks. It does not drop the tote or rewrite the file.`}
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
