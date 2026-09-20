import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { GALLEY_EMPTY_LINE, GALLEY_TABLE_LINE } from "@/lib/listing-galley";
import { listingPath } from "@/lib/paths";

export function ListingGalleyEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-galley-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Galley not taped"
        title={GALLEY_EMPTY_LINE}
        body={`${GALLEY_TABLE_LINE} Tape it when walkers still want the shop galley. It does not drop the tote or rewrite the file. Print proof, not a login.`}
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
