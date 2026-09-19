import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { WARM_EMPTY_LINE, WARM_TABLE_LINE } from "@/lib/listing-warm";
import { listingPath } from "@/lib/paths";

export function ListingWarmEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-warm-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Open to warm"
        title={WARM_EMPTY_LINE}
        body={`${WARM_TABLE_LINE} Tape it when walkers still want a night look, or four. It does not drop the tote or rewrite the file.`}
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
