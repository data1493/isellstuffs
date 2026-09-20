import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { BOOTH_RACE_EMPTY_COPY, BOOTH_RACE_PAPER_LINE } from "@/lib/booth-race";
import { stallPath } from "@/lib/paths";

export function BoothRaceEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-race-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I don't have a race"
        title={BOOTH_RACE_EMPTY_COPY}
        body={`${BOOTH_RACE_PAPER_LINE} Nobody taped a race note on ${boothName} in this browser. Still a crate.`}
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
