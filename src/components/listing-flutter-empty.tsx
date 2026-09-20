import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { FLUTTER_EMPTY_LINE, FLUTTER_TABLE_LINE } from "@/lib/listing-flutter";
import { listingPath } from "@/lib/paths";

export function ListingFlutterEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-flutter-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Flutter not taped"
        title={FLUTTER_EMPTY_LINE}
        body={`${FLUTTER_TABLE_LINE} Tape it when walkers still want a shop wow. It does not drop the tote or mark it sold.`}
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
