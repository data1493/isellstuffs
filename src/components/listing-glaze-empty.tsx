import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { GLAZE_EMPTY_LINE, GLAZE_TABLE_LINE } from "@/lib/listing-glaze";
import { listingPath } from "@/lib/paths";

export function ListingGlazeEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-glaze-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Glaze not taped"
        title={GLAZE_EMPTY_LINE}
        body={`${GLAZE_TABLE_LINE} Tape it when walkers still want a fired coat over the rim. It does not drop the tote or mark it sold.`}
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
