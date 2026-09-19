import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { GLASS_EMPTY_LINE, GLASS_TABLE_LINE } from "@/lib/listing-glass";
import { listingPath } from "@/lib/paths";

export function ListingGlassEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-glass-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Glass not taped"
        title={GLASS_EMPTY_LINE}
        body={`${GLASS_TABLE_LINE} Tape it when walkers still want a lid that isn’t glass. It does not drop the tote or mark it sold.`}
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
