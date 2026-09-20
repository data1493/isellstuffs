import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import {
  BOOTH_MANDREL_EMPTY_COPY,
  BOOTH_MANDREL_PAPER_LINE,
} from "@/lib/booth-mandrel";
import { stallPath } from "@/lib/paths";

export function BoothMandrelEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-mandrel-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I don't have a mandrel"
        title={BOOTH_MANDREL_EMPTY_COPY}
        body={`${BOOTH_MANDREL_PAPER_LINE} Nobody taped a mandrel note on ${boothName} in this browser. Still a table.`}
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
