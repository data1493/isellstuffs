import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { HEAT_EMPTY_LINE, HEAT_TABLE_LINE } from "@/lib/listing-heat";
import { listingPath } from "@/lib/paths";

export function ListingHeatEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-heat-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="No heat tape"
        title={HEAT_EMPTY_LINE}
        body={`${HEAT_TABLE_LINE} Tape it when the gold rim cannot go in. It does not drop the tote or wrap the booth.`}
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
