import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { ACES_EMPTY_LINE, ACES_TABLE_LINE } from "@/lib/listing-aces";
import { listingPath } from "@/lib/paths";

export function ListingAcesEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-aces-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Aces not taped"
        title={ACES_EMPTY_LINE}
        body={`${ACES_TABLE_LINE} Tape it when walkers still want a shop ACES IDT. It does not drop the tote or rewrite the file.`}
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
