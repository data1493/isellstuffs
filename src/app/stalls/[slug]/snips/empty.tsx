import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import {
  BOOTH_SNIPS_EMPTY_COPY,
  BOOTH_SNIPS_PAPER_LINE,
} from "@/lib/booth-snips";
import { stallPath } from "@/lib/paths";

export function BoothSnipsEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-snips-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I don't have snips"
        title={BOOTH_SNIPS_EMPTY_COPY}
        body={`${BOOTH_SNIPS_PAPER_LINE} Nobody taped a snips note on ${boothName} in this browser. Still a driveway. Still a tangle.`}
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
