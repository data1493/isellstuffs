import type { Metadata } from "next";

import { CampaignMissing } from "@/components/mall-missing";
import { advertisePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const metadata: Metadata = shareMetadata({
  title: "Campaign packed up",
  description:
    "That campaign URL is not on the floor. Only two windows bought a souvenir page.",
  path: advertisePath(),
  robots: { index: false, follow: true },
});

export default function CampaignSlugNotFound() {
  return <CampaignMissing />;
}
