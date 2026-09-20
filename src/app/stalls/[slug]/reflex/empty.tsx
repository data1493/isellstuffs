import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import {
  BOOTH_REFLEX_EMPTY_COPY,
  BOOTH_REFLEX_PAPER_LINE,
} from "@/lib/booth-reflex";
import { stallPath } from "@/lib/paths";

export function BoothReflexEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-reflex-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I don't have a reflex"
        title={BOOTH_REFLEX_EMPTY_COPY}
        body={`${BOOTH_REFLEX_PAPER_LINE} Nobody taped a reflex note on ${boothName} in this browser. Still a crate. Still a skip.`}
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
