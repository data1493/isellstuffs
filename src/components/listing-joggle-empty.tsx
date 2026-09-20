import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { JOGGLE_EMPTY_LINE, JOGGLE_TABLE_LINE } from "@/lib/listing-joggle";
import { listingPath } from "@/lib/paths";

export function ListingJoggleEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-joggle-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Joggle not taped"
        title={JOGGLE_EMPTY_LINE}
        body={`${JOGGLE_TABLE_LINE} Tape it when walkers still want the tines offset. It does not drop the tote or mark it sold.`}
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
