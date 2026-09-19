import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { CRUSH_EMPTY_LINE, CRUSH_TABLE_LINE } from "@/lib/listing-crush";
import { listingPath } from "@/lib/paths";

export function ListingCrushEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-crush-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Crush not taped"
        title={CRUSH_EMPTY_LINE}
        body={`${CRUSH_TABLE_LINE} Tape it when walkers still want the kicks crushed. It does not drop the tote or rewrite the file.`}
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
