import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { BUY_EMPTY_COPY } from "@/lib/booth-buys";
import { stallPath } from "@/lib/paths";

export function BoothBuysEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-buy-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I buy that"
        title={BUY_EMPTY_COPY}
        body={`Nobody taped a buy on ${boothName} in this browser. Write the title — scratched LPs — and leave it on this booth. Wanted stays the walker cork.`}
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
