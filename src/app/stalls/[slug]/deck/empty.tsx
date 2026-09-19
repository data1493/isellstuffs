import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { BOOTH_DECK_EMPTY_COPY, BOOTH_DECK_PAPER_LINE } from "@/lib/booth-deck";
import { stallPath } from "@/lib/paths";

export function BoothDeckEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-deck-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I don't have a deck"
        title={BOOTH_DECK_EMPTY_COPY}
        body={`${BOOTH_DECK_PAPER_LINE} Nobody taped a deck note on ${boothName} in this browser. Plays is I already spun it. Skip is the scratch. Walkers still ask Sunday Crate to cue the LP.`}
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
