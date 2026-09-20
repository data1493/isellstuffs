import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { HOTBAR_EMPTY_LINE, HOTBAR_TABLE_LINE } from "@/lib/listing-hotbar";
import { listingPath } from "@/lib/paths";

export function ListingHotbarEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-hotbar-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Hotbar not taped"
        title={HOTBAR_EMPTY_LINE}
        body={`${HOTBAR_TABLE_LINE} Tape it when walkers still want a shop pulse-bond. It does not drop the tote or mark it sold.`}
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
