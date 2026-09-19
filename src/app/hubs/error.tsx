"use client";

import { BrowseError } from "@/components/browse/states";

export default function HubsError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <BrowseError
      title="This aisle went dark."
      body="The hub did not load. Try again, or walk back to the concourse and pick another floor."
      onRetry={retry}
    />
  );
}
