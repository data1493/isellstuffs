"use client";

import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";

export default function ThisWeekError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <MallNotice
      tone="error"
      eyebrow="Weekend table stuck"
      title="The drop did not set up."
      body="The table is still on the floor. Try again, or walk the concourse and pick something yourself."
      actions={
        <>
          <Button className="rounded-full px-5" onClick={reset}>
            Tape it again
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href="/" />}
          >
            Home concourse
          </Button>
        </>
      }
    />
  );
}
