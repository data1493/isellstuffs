import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { HAIR_EMPTY_LINE, HAIR_TABLE_LINE } from "@/lib/listing-hair";
import { listingPath } from "@/lib/paths";

export function ListingHairEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-hair-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Hair not taped"
        title={HAIR_EMPTY_LINE}
        body={`${HAIR_TABLE_LINE} Tape it when the furniture or textile already holds pet hair. It does not drop the tote or mark it sold.`}
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
