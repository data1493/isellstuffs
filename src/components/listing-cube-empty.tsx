import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { CUBE_EMPTY_LINE, CUBE_TABLE_LINE } from "@/lib/listing-cube";
import { listingPath } from "@/lib/paths";

export function ListingCubeEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-cube-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Cube not taped"
        title={CUBE_EMPTY_LINE}
        body={`${CUBE_TABLE_LINE} Tape it when walkers still want a fourth .cube. It does not drop the tote or rewrite the file.`}
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
