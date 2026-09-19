"use client";

import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";

export default function CheckoutError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <MallNotice
      tone="error"
      eyebrow="Checkout"
      title="The register jammed."
      body="Pay did not open. Nothing was charged. Try again, or put the bag back on the hook."
      actions={
        <>
          <Button className="rounded-full px-5" onClick={reset}>
            Try the register again
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href="/cart" />}
          >
            Return to tote
          </Button>
        </>
      }
    />
  );
}
