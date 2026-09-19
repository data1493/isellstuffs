import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import {
  REFLOW_EMPTY_LINE,
  REFLOW_TABLE_LINE,
} from "@/lib/listing-reflow";
import { listingPath } from "@/lib/paths";

export function ListingReflowEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-reflow-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Reflow not taped"
        title={REFLOW_EMPTY_LINE}
        body={`${REFLOW_TABLE_LINE} Tape it when walkers still want the joints heated. It does not drop the tote or mark it sold.`}
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
