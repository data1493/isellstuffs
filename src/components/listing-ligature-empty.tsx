import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import {
  LIGATURE_EMPTY_LINE,
  LIGATURE_TABLE_LINE,
} from "@/lib/listing-ligature";
import { listingPath } from "@/lib/paths";

export function ListingLigatureEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-ligature-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Ligature not taped"
        title={LIGATURE_EMPTY_LINE}
        body={`${LIGATURE_TABLE_LINE} Tape it when walkers still want the pairs joined. It does not drop the tote or rewrite the file.`}
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
