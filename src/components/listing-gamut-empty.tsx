import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { GAMUT_EMPTY_LINE, GAMUT_TABLE_LINE } from "@/lib/listing-gamut";
import { listingPath } from "@/lib/paths";

export function ListingGamutEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-gamut-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Gamut not taped"
        title={GAMUT_EMPTY_LINE}
        body={`${GAMUT_TABLE_LINE} Tape it when walkers still want shop-legal primaries. It does not drop the tote or rewrite the file.`}
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
