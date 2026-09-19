import { notFound } from "next/navigation";

export const dynamicParams = false;

export function generateStaticParams(): { slug: string }[] {
  return [];
}

export default function UnknownCampaignPage() {
  notFound();
}
