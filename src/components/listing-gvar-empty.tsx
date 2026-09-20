import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { GVAR_EMPTY_LINE, GVAR_TABLE_LINE } from "@/lib/listing-gvar";
import { listingPath } from "@/lib/paths";

export function ListingGvarEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-gvar-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Gvar not taped"
        title={GVAR_EMPTY_LINE}
        body={`${GVAR_TABLE_LINE} Tape it when walkers still want a shop glyph-variation table. It does not drop the tote or mark it sold.`}
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
