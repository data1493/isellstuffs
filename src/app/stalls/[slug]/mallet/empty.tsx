import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import {
  BOOTH_MALLET_EMPTY_COPY,
  BOOTH_MALLET_PAPER_LINE,
} from "@/lib/booth-mallet";
import { stallPath } from "@/lib/paths";

export function BoothMalletEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-mallet-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I don't have a mallet"
        title={BOOTH_MALLET_EMPTY_COPY}
        body={`${BOOTH_MALLET_PAPER_LINE} Nobody taped a mallet note on ${boothName} in this browser. Still a driveway. Still a stain.`}
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
