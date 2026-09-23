"use client";

import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { donatePath } from "@/lib/paths";

export default function DonateError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <MallNotice
      tone="error"
      eyebrow="Jar stuck"
      title="The paper would not drop."
      body="The jar did not load. Nothing left the tote. Try again, or walk back to Agent Row."
      actions={
        <>
          <Button className="rounded-full px-5" onClick={reset}>
            Open the jar again
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={donatePath()} />}
          >
            Back to the jar
          </Button>
        </>
      }
    />
  );
}
