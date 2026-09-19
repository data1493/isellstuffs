import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { GATE_EMPTY_LINE, GATE_TABLE_LINE } from "@/lib/listing-gate";
import { listingPath } from "@/lib/paths";

export function ListingGateEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-gate-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Gate not taped"
        title={GATE_EMPTY_LINE}
        body={`${GATE_TABLE_LINE} Tape it when walkers still want the tails gone. It does not drop the tote or rewrite the file.`}
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
