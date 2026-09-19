import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { DART_EMPTY_LINE, DART_TABLE_LINE } from "@/lib/listing-dart";
import { listingPath } from "@/lib/paths";

export function ListingDartEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-dart-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Dart not taped"
        title={DART_EMPTY_LINE}
        body={`${DART_TABLE_LINE} Tape it when walkers still want the sides taken in. It does not drop the tote or mark it sold.`}
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
