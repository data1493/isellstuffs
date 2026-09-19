import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { BOOTH_MATCH_EMPTY_COPY, BOOTH_MATCH_PAPER_LINE } from "@/lib/booth-match";
import { stallPath } from "@/lib/paths";

export function BoothMatchEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-match-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Nothing matches"
        title={BOOTH_MATCH_EMPTY_COPY}
        body={`${BOOTH_MATCH_PAPER_LINE} Nobody taped a match note on ${boothName} in this browser. Fits is the lid. Walkers still hunt The Sink Drawer for the matching pot.`}
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
