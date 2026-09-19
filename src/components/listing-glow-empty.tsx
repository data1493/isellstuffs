import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { GLOW_EMPTY_LINE, GLOW_TABLE_LINE } from "@/lib/listing-glow";
import { listingPath } from "@/lib/paths";

export function ListingGlowEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-glow-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Backlight not taped"
        title={GLOW_EMPTY_LINE}
        body={`${GLOW_TABLE_LINE} Tape it when walkers still want a light behind Tetris. It does not drop the tote or mark it sold.`}
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
