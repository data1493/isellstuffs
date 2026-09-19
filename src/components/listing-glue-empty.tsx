import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { GLUE_EMPTY_LINE, GLUE_TABLE_LINE } from "@/lib/listing-glue";
import { listingPath } from "@/lib/paths";

export function ListingGlueEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-glue-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Glue not taped"
        title={GLUE_EMPTY_LINE}
        body={`${GLUE_TABLE_LINE} Tape it when walkers still want the plastic one piece. It does not drop the tote or mark it sold.`}
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
