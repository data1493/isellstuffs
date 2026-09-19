import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import {
  BOOTH_BUTTONS_EMPTY_COPY,
  BOOTH_BUTTONS_PAPER_LINE,
} from "@/lib/booth-buttons";
import { stallPath } from "@/lib/paths";

export function BoothButtonsEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-buttons-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I don't have buttons"
        title={BOOTH_BUTTONS_EMPTY_COPY}
        body={`${BOOTH_BUTTONS_PAPER_LINE} Nobody taped a buttons note on ${boothName} in this browser. Snaps stay. Still tote.`}
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
