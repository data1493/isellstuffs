import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import {
  BOOTH_PINS_EMPTY_COPY,
  BOOTH_PINS_PAPER_LINE,
} from "@/lib/booth-pins";
import { stallPath } from "@/lib/paths";

export function BoothPinsEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-pins-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I don't have pins"
        title={BOOTH_PINS_EMPTY_COPY}
        body={`${BOOTH_PINS_PAPER_LINE} Nobody taped a pins note on ${boothName} in this browser. Hem stays. Still tote.`}
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
