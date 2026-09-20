import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { DETUNE_EMPTY_LINE, DETUNE_TABLE_LINE } from "@/lib/listing-detune";
import { listingPath } from "@/lib/paths";

export function ListingDetuneEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-detune-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Detune not taped"
        title={DETUNE_EMPTY_LINE}
        body={`${DETUNE_TABLE_LINE} Tape it when walkers still want a shop pitch slip. It does not drop the tote or rewrite the file.`}
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
