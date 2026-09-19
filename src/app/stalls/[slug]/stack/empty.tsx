import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { BOOTH_STACK_EMPTY_COPY, BOOTH_STACK_PAPER_LINE } from "@/lib/booth-stack";
import { stallPath } from "@/lib/paths";

export function BoothStackEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-stack-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Don't unfold the pile"
        title={BOOTH_STACK_EMPTY_COPY}
        body={`${BOOTH_STACK_PAPER_LINE} Nobody taped a pile note on ${boothName} in this browser. Ask is the LP flip. Walkers still wreck Hall Closet for a Medium.`}
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
