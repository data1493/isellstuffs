import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import {
  BOOTH_TWEEZERS_EMPTY_COPY,
  BOOTH_TWEEZERS_PAPER_LINE,
} from "@/lib/booth-tweezers";
import { stallPath } from "@/lib/paths";

export function BoothTweezersEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-tweezers-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I don't have tweezers"
        title={BOOTH_TWEEZERS_EMPTY_COPY}
        body={`${BOOTH_TWEEZERS_PAPER_LINE} Nobody taped a tweezers note on ${boothName} in this browser. Still a driveway. Still a crack.`}
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
