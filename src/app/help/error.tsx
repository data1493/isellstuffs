"use client";

import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { helpPath } from "@/lib/paths";

export default function HelpError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <MallNotice
      tone="error"
      eyebrow="How-to stuck"
      title="The help page did not tape."
      body="The mall still works the same way: browse, tote, mock pay, folder slip, list a stall, fees. Try the how-to again, or walk the concourse."
      actions={
        <>
          <Button className="rounded-full px-5" onClick={reset}>
            Tape it again
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={helpPath()} />}
          >
            Back to help
          </Button>
        </>
      }
    />
  );
}
