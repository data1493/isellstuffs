import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { ACF_EMPTY_LINE, ACF_TABLE_LINE } from "@/lib/listing-acf";
import { listingPath } from "@/lib/paths";

export function ListingAcfEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-acf-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Acf not taped"
        title={ACF_EMPTY_LINE}
        body={`${ACF_TABLE_LINE} Tape it when walkers still want shop anisotropic film. It does not drop the tote or mark it sold.`}
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
