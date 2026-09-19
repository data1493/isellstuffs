import type { Metadata } from "next";

import { StallMissing } from "@/components/mall-missing";
import { missingStallMetadata } from "@/lib/seo";

export const metadata: Metadata = missingStallMetadata();

export default function StallNotFound() {
  return <StallMissing />;
}
