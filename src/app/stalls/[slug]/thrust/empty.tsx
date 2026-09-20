import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import {
  BOOTH_THRUST_EMPTY_COPY,
  BOOTH_THRUST_PAPER_LINE,
} from "@/lib/booth-thrust";
import { stallPath } from "@/lib/paths";

export function BoothThrustEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-thrust-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I don't have a thrust"
        title={BOOTH_THRUST_EMPTY_COPY}
        body={`${BOOTH_THRUST_PAPER_LINE} Nobody taped a thrust note on ${boothName} in this browser. Still a crate.`}
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
