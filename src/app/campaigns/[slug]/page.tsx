import { CampaignMissing } from "@/components/mall-missing";

export const dynamicParams = false;

export function generateStaticParams(): { slug: string }[] {
  return [];
}

export default function UnknownCampaignPage() {
  return <CampaignMissing />;
}
