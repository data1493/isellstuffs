"use client";

import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { giftPath } from "@/lib/paths";

export default function GiftError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <MallNotice
      tone="error"
      eyebrow="Gift desk stuck"
      title="The paper would not stamp."
      body="The gift desk did not load. The tote is unchanged. Try again, or walk back to the card."
      actions={
        <>
          <Button className="rounded-full px-5" onClick={reset}>
            Try the desk again
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={giftPath()} />}
          >
            Back to the desk
          </Button>
        </>
      }
    />
  );
}
