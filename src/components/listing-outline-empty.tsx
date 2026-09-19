import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import {
  OUTLINE_EMPTY_LINE,
  OUTLINE_TABLE_LINE,
} from "@/lib/listing-outline";
import { listingPath } from "@/lib/paths";

export function ListingOutlineEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-outline-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Outline not taped"
        title={OUTLINE_EMPTY_LINE}
        body={`${OUTLINE_TABLE_LINE} Tape it when walkers still want the map outlined. It does not drop the tote or rewrite the file.`}
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
