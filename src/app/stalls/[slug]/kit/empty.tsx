import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import {
  BOOTH_KIT_EMPTY_COPY,
  BOOTH_KIT_PAPER_LINE,
} from "@/lib/booth-kit";
import { stallPath } from "@/lib/paths";

export function BoothKitEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-kit-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I don't assemble"
        title={BOOTH_KIT_EMPTY_COPY}
        body={`${BOOTH_KIT_PAPER_LINE} Nobody taped a kit note on ${boothName} in this browser. Shade stays in the box.`}
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
