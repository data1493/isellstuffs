import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { POSTERIZE_EMPTY_LINE, POSTERIZE_TABLE_LINE } from "@/lib/listing-posterize";
import { listingPath } from "@/lib/paths";

export function ListingPosterizeEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-posterize-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Posterize not taped"
        title={POSTERIZE_EMPTY_LINE}
        body={`${POSTERIZE_TABLE_LINE} Tape it when walkers still want four-stop flats on the parking-lot looks. It does not drop the tote or rewrite the file.`}
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
