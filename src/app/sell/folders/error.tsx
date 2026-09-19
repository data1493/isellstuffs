"use client";

import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { sellDeskPath, sellFoldersPath } from "@/lib/paths";

export default function SellFoldersError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <MallNotice
      tone="error"
      eyebrow="Folder tape stuck"
      title="The folder tape did not open."
      body="Paid slips are still on this browser. Try the tape again, or walk back to the desk."
      actions={
        <>
          <Button className="rounded-full px-5" onClick={reset}>
            Try the tape again
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={sellFoldersPath()} />}
          >
            Back to the tape
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={sellDeskPath()} />}
          >
            Tuesday desk
          </Button>
        </>
      }
    />
  );
}
