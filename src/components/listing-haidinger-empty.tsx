import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { HAIDINGER_EMPTY_LINE, HAIDINGER_TABLE_LINE } from "@/lib/listing-haidinger";
import { listingPath } from "@/lib/paths";

export function ListingHaidingerEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-haidinger-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Haidinger not taped"
        title={HAIDINGER_EMPTY_LINE}
        body={`${HAIDINGER_TABLE_LINE} Tape it when walkers still want shop Haidinger fringes. It does not drop the tote or mark it sold.`}
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
