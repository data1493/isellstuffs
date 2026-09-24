"use client";

import { PortalError } from "@/components/portals/portal-error";

export default function TradeSlipError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PortalError
      reset={reset}
      eyebrow="Slip down"
      title="That slip did not load."
      body="No confirm was written. Try the slip again, or go back to the board."
    />
  );
}
