import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { BLUEZONE_EMPTY_LINE, BLUEZONE_TABLE_LINE } from "@/lib/listing-bluezone";
import { listingPath } from "@/lib/paths";

export function ListingBluezoneEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-bluezone-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Bluezone not taped"
        title={BLUEZONE_EMPTY_LINE}
        body={`${BLUEZONE_TABLE_LINE} Tape it when walkers still want shop alignment zones. It does not drop the tote or rewrite the file.`}
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
