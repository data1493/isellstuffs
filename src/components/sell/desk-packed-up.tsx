import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { sellDeskPath, sellPath } from "@/lib/paths";

export function DeskPackedUp() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Packed up"
      title="That stall packed up."
      body="The mall does not open a desk for a booth it does not have. Walk back to sell, or open the Tuesday door."
      actions={
        <>
          <Button
            className="rounded-full px-5"
            render={<Link href={sellDeskPath()} />}
          >
            Tuesday desk
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={sellPath()} />}
          >
            Back to sell
          </Button>
        </>
      }
    />
  );
}
