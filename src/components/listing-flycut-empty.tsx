import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { FLYCUT_EMPTY_LINE, FLYCUT_TABLE_LINE } from "@/lib/listing-flycut";
import { listingPath } from "@/lib/paths";

export function ListingFlycutEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-flycut-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Flycut not taped"
        title={FLYCUT_EMPTY_LINE}
        body={`${FLYCUT_TABLE_LINE} Tape it when walkers still want a shop skim of the glass. It does not drop the tote or mark it sold.`}
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
