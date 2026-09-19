import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import {
  REMEMBER_EMPTY_LINE,
  REMEMBER_TABLE_LINE,
} from "@/lib/listing-remember";
import { listingPath } from "@/lib/paths";

export function ListingRememberEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-remember-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Still the page"
        title={REMEMBER_EMPTY_LINE}
        body={`${REMEMBER_TABLE_LINE} Tape it when walkers still want a Discogs liner. It does not drop the tote or rewrite the file.`}
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
