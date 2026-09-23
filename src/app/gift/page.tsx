import type { Metadata } from "next";
import { cookies } from "next/headers";

import { GiftDesk } from "@/components/gift/gift-desk";
import { GIFT_CREDITS_COOKIE, parseGiftCredits } from "@/lib/gift-desk";
import { giftPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = shareMetadata({
  title: "Gift desk",
  description:
    "Bring the stand-in mall gift code. The desk stamps $25 on paper. Not a tote coupon. Checkout is still test pay.",
  path: giftPath(),
  robots: { index: false, follow: false },
});

type GiftPageProps = {
  searchParams?: Promise<{ error?: string | string[] }>;
};

export default async function GiftPage({ searchParams }: GiftPageProps) {
  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const credits = parseGiftCredits(jar.get(GIFT_CREDITS_COOKIE)?.value);

  return <GiftDesk credits={credits} unknown={error === "unknown"} />;
}
