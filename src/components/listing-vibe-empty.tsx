import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { VIBE_EMPTY_LINE, VIBE_TABLE_LINE } from "@/lib/listing-vibe";
import { listingPath } from "@/lib/paths";

export function ListingVibeEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-vibe-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Vibes"
        title={VIBE_EMPTY_LINE}
        body={`${VIBE_TABLE_LINE} Tape it when walkers ask for cups or a clean reprint. It does not drop the tote or rewrite the file.`}
        actions={
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={listingPath(listingId)} />}
          >
            Back to the listing
          </Button>
        }
      />
    </div>
  );
}
