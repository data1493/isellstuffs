import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import {
  RESONANCE_EMPTY_LINE,
  RESONANCE_TABLE_LINE,
} from "@/lib/listing-resonance";
import { listingPath } from "@/lib/paths";

export function ListingResonanceEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-resonance-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Resonance not taped"
        title={RESONANCE_EMPTY_LINE}
        body={`${RESONANCE_TABLE_LINE} Tape it when walkers still want shop arm resonance. It does not drop the tote or mark it sold.`}
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
