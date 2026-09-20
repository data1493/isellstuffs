import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { SHAPER_EMPTY_LINE, SHAPER_TABLE_LINE } from "@/lib/listing-shaper";
import { listingPath } from "@/lib/paths";

export function ListingShaperEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-shaper-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Shaper not taped"
        title={SHAPER_EMPTY_LINE}
        body={`${SHAPER_TABLE_LINE} Tape it when walkers still want a 1D on the parking-lot looks. It does not drop the tote or rewrite the file.`}
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
