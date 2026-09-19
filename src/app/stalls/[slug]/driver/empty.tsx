import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import {
  BOOTH_DRIVER_EMPTY_COPY,
  BOOTH_DRIVER_PAPER_LINE,
} from "@/lib/booth-driver";
import { stallPath } from "@/lib/paths";

export function BoothDriverEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-driver-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I don't have a driver"
        title={BOOTH_DRIVER_EMPTY_COPY}
        body={`${BOOTH_DRIVER_PAPER_LINE} Nobody taped a driver note on ${boothName} in this browser. Blister stays closed.`}
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
