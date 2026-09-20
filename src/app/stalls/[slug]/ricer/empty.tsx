import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import {
  BOOTH_RICER_EMPTY_COPY,
  BOOTH_RICER_PAPER_LINE,
} from "@/lib/booth-ricer";
import { stallPath } from "@/lib/paths";

export function BoothRicerEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-ricer-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I don't have a ricer"
        title={BOOTH_RICER_EMPTY_COPY}
        body={`${BOOTH_RICER_PAPER_LINE} Nobody taped a ricer note on ${boothName} in this browser. Still a drawer.`}
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
