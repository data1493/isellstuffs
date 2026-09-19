import type { Metadata } from "next";

import { ListingMissing } from "@/components/mall-missing";
import { missingListingMetadata } from "@/lib/seo";

export const metadata: Metadata = missingListingMetadata();

export default function ListingNotFound() {
  return <ListingMissing />;
}
