import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import {
  BOOTH_BONE_EMPTY_COPY,
  BOOTH_BONE_PAPER_LINE,
} from "@/lib/booth-bone";
import { stallPath } from "@/lib/paths";

export function BoothBoneEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-bone-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I don't have a bone"
        title={BOOTH_BONE_EMPTY_COPY}
        body={`${BOOTH_BONE_PAPER_LINE} Nobody taped a bone note on ${boothName} in this browser. Still a driveway. Still a grocery bag.`}
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
