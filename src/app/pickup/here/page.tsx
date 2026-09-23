import type { Metadata } from "next";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { HERE_COPY } from "@/lib/here-handoff";
import { pickupHerePath, pickupPath, sellDeskQueuePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = shareMetadata({
  title: "Nobody is in the drive",
  description:
    "Mark walking up from a paid physical slip. Files stay in the folder. Not taken. Not a civic color.",
  path: pickupHerePath(),
  robots: { index: false, follow: false },
});

export default function PickupHerePage() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Walking up"
      title="Nobody is in the drive."
      body={`${HERE_COPY} Missing slip, a file, a gift code, or they already left with it. Mark walking up from a paid physical pickup card.`}
      actions={
        <>
          <Button
            className="rounded-full px-5"
            render={<Link href={pickupPath()} />}
          >
            Buyer pickup slip
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={sellDeskQueuePath()} />}
          >
            Driveway queue
          </Button>
        </>
      }
    />
  );
}
