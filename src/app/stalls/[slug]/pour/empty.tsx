import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { BOOTH_POUR_EMPTY_COPY, BOOTH_POUR_PAPER_LINE } from "@/lib/booth-pour";
import { stallPath } from "@/lib/paths";

export function BoothPourEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-pour-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I don't pour"
        title={BOOTH_POUR_EMPTY_COPY}
        body={`${BOOTH_POUR_PAPER_LINE} Nobody taped a pour note on ${boothName} in this browser. Heat is the microwave. Chip is the diner rim. Match is nothing matches.`}
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
