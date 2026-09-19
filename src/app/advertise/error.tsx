"use client";

import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";

export default function AdvertiseError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <MallNotice
      tone="error"
      eyebrow="Rate card stuck"
      title="The advertising desk did not load."
      body="The corners are still on the floor. Try the desk again, or walk the concourse and read the stamps yourself."
      actions={
        <>
          <Button className="rounded-full px-5" onClick={reset}>
            Try the desk again
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
