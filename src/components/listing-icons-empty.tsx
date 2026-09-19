import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { ICONS_EMPTY_LINE, ICONS_TABLE_LINE } from "@/lib/listing-icons";
import { listingPath } from "@/lib/paths";

export function ListingIconsEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-icons-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Two weights"
        title={ICONS_EMPTY_LINE}
        body={`${ICONS_TABLE_LINE} Tape it when walkers still want the restrooms glyph. It does not drop the tote or rewrite the file.`}
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
