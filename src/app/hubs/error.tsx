"use client";

import { BrowseError } from "@/components/browse/states";

export default function HubsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <BrowseError
      title="This aisle went dark."
      body="The hub did not load. Try again, or walk back to the concourse and pick another floor."
      onRetry={reset}
    />
  );
}
