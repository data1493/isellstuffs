import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import {
  BOOTH_STATOR_EMPTY_COPY,
  BOOTH_STATOR_PAPER_LINE,
} from "@/lib/booth-stator";
import { stallPath } from "@/lib/paths";

export function BoothStatorEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-stator-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I don't have a stator"
        title={BOOTH_STATOR_EMPTY_COPY}
        body={`${BOOTH_STATOR_PAPER_LINE} Nobody taped a stator note on ${boothName} in this browser. Still a crate.`}
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
