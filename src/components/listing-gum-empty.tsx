import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { GUM_EMPTY_LINE, GUM_TABLE_LINE } from "@/lib/listing-gum";
import { listingPath } from "@/lib/paths";

export function ListingGumEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-gum-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Stickers not taped"
        title={GUM_EMPTY_LINE}
        body={`${GUM_TABLE_LINE} Tape it when walkers still want the shop tags off the empties. It does not drop the tote or mark it sold.`}
        actions={
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={listingPath(listingId)} />}
          >
            Back to the listing
          </Button>
        }
      />
    </div>
  );
}
