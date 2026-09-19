import type { Metadata } from "next";
import { cookies } from "next/headers";

import { BoothBuysBoard } from "@/components/stalls/booth-buys-board";
import { StallMissing } from "@/components/mall-missing";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_BUYS_COOKIE_NAME,
  buyTitlesForStall,
  parseBoothBuys,
} from "@/lib/booth-buys";
import { stallBuyPath } from "@/lib/paths";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type BoothBuysPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: BoothBuysPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I buy that · ${stall.boothName}`,
    description: `Titles ${stall.boothName} also buys. Wanted is walkers. Scrap is a lid question.`,
    path: stallBuyPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallBuyPage({
  params,
  searchParams,
}: BoothBuysPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const titles = buyTitlesForStall(
    parseBoothBuys(jar.get(BOOTH_BUYS_COOKIE_NAME)?.value),
    stall.id,
  );

  return (
    <BoothBuysBoard stall={stall} titles={titles} emptyTape={error === "empty"} />
  );
}
