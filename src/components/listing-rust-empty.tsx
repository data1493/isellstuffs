import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { RUST_EMPTY_LINE, RUST_TABLE_LINE } from "@/lib/listing-rust";
import { listingPath } from "@/lib/paths";

export function ListingRustEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-rust-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Rust not taped"
        title={RUST_EMPTY_LINE}
        body={`${RUST_TABLE_LINE} Tape it when walkers still want the wires chrome. It does not drop the tote or write a spare tine.`}
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
