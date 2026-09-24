"use client";

import { PortalError } from "@/components/portals/portal-error";

export default function TradeError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PortalError
      reset={reset}
      eyebrow="Trade down"
      title="The board did not load."
      body="No lot was listed and no take was written. Try the board again."
    />
  );
}
