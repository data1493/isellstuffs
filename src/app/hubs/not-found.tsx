import type { Metadata } from "next";

import { HubNotFound } from "@/components/browse/states";
import { missingHubMetadata } from "@/lib/seo";

export const metadata: Metadata = missingHubMetadata();

export default function HubsNotFound() {
  return <HubNotFound />;
}
