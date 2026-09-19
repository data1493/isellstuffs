import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { GRADE_EMPTY_LINE, GRADE_TABLE_LINE } from "@/lib/listing-grade";
import { listingPath } from "@/lib/paths";

export function ListingGradeEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-grade-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="As-shot"
        title={GRADE_EMPTY_LINE}
        body={`${GRADE_TABLE_LINE} Tape it when walkers ask for a custom grade. It does not drop the tote or rewrite the file.`}
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
