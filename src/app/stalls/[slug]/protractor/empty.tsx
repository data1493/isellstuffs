import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import {
  BOOTH_PROTRACTOR_EMPTY_COPY,
  BOOTH_PROTRACTOR_PAPER_LINE,
} from "@/lib/booth-protractor";
import { stallPath } from "@/lib/paths";

export function BoothProtractorEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-protractor-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I don't have a protractor"
        title={BOOTH_PROTRACTOR_EMPTY_COPY}
        body={`${BOOTH_PROTRACTOR_PAPER_LINE} Nobody taped a protractor note on ${boothName} in this browser. Still a crate. Still a skip.`}
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
