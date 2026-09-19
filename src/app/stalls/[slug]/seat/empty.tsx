import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { BOOTH_SEAT_EMPTY_COPY, BOOTH_SEAT_PAPER_LINE } from "@/lib/booth-seat";
import { stallPath } from "@/lib/paths";

export function BoothSeatEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-seat-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Don't sit on the crate"
        title={BOOTH_SEAT_EMPTY_COPY}
        body={`${BOOTH_SEAT_PAPER_LINE} Nobody taped a sit note on ${boothName} in this browser. Stay is hangers. Kids is you-buy-it. Walkers still sit on Sunday Crate.`}
        actions={
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={stallPath(slug)} />}
          >
            Back to the stall
          </Button>
        }
      />
    </div>
  );
}
