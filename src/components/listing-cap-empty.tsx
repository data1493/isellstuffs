import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { CAP_EMPTY_LINE, CAP_TABLE_LINE } from "@/lib/listing-cap";
import { listingPath } from "@/lib/paths";

export function ListingCapEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-cap-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Cap not taped"
        title={CAP_EMPTY_LINE}
        body={`${CAP_TABLE_LINE} Tape it when walkers still want a travel lid. It does not drop the tote or mark it sold.`}
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
