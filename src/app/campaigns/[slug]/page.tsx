import type { Metadata } from "next";
import { cookies } from "next/headers";

import { HomepageCampaignLander } from "@/components/ads/homepage-campaign-lander";
import { YardSaleCampaignLander } from "@/components/ads/yard-sale-campaign-lander";
import { CampaignMissing } from "@/components/mall-missing";
import { AD_BOOKINGS_COOKIE } from "@/lib/ad-booking";
import {
  homepageBeatsCampaign,
  soldCampaigns,
  yardSaleTuesdayCampaign,
} from "@/lib/ads-display";
import {
  campaignBookingsFromCookie,
  resolveCampaignLander,
} from "@/lib/booked-campaign";
import { advertisePath, campaignPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export function generateStaticParams(): { slug: string }[] {
  return soldCampaigns.map((campaign) => ({ slug: campaign.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const jar = await cookies();
  const lander = resolveCampaignLander(
    slug,
    campaignBookingsFromCookie(jar.get(AD_BOOKINGS_COOKIE)?.value),
  );

  if (!lander) {
    return shareMetadata({
      title: "Campaign packed up",
      description:
        "That campaign URL is not on the floor. Only two windows bought a souvenir page.",
      path: advertisePath(),
      robots: { index: false, follow: true },
    });
  }

  return shareMetadata({
    title: lander.slot.headline,
    description: lander.slot.blurb,
    path: campaignPath(lander.slug),
  });
}

export default async function CampaignSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const jar = await cookies();
  const lander = resolveCampaignLander(
    slug,
    campaignBookingsFromCookie(jar.get(AD_BOOKINGS_COOKIE)?.value),
  );

  if (!lander) {
    return <CampaignMissing />;
  }

  if (lander.slug === homepageBeatsCampaign.slug) {
    return <HomepageCampaignLander lander={lander} />;
  }

  if (lander.slug === yardSaleTuesdayCampaign.slug) {
    return <YardSaleCampaignLander lander={lander} />;
  }

  return <CampaignMissing />;
}
