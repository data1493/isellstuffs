"use client";

import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { advertiseBookPath, advertisePath } from "@/lib/paths";

export default function AdvertiseReceiptError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <MallNotice
      tone="error"
      eyebrow="Slip jammed"
      title="The receipt did not load."
      body="The booking may still be in this browser. Try again, or book the corner one more time."
      actions={
        <>
          <Button className="rounded-full px-5" onClick={reset}>
            Try the slip again
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={advertiseBookPath()} />}
          >
            Book next weekend
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={advertisePath()} />}
          >
            Rate card
          </Button>
        </>
      }
    />
  );
}
