import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { BOOTH_POSE_EMPTY_COPY, BOOTH_POSE_PAPER_LINE } from "@/lib/booth-pose";
import { stallPath } from "@/lib/paths";

export function BoothPoseEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-pose-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Nothing with a lookbook"
        title={BOOTH_POSE_EMPTY_COPY}
        body={`${BOOTH_POSE_PAPER_LINE} Nobody taped a lookbook note on ${boothName} in this browser. Film is the tags. Stack is the pile. Sew is a hem.`}
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
