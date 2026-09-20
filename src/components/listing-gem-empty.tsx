import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { GEM_EMPTY_LINE, GEM_TABLE_LINE } from "@/lib/listing-gem";
import { listingPath } from "@/lib/paths";

export function ListingGemEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-gem-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Gem not taped"
        title={GEM_EMPTY_LINE}
        body={`${GEM_TABLE_LINE} Tape it when walkers still want a shop gemming rib. It does not drop the tote or mark it sold.`}
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
