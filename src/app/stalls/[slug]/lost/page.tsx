import type { Metadata } from "next";
import { cookies } from "next/headers";

import { BoothLostBoard } from "@/components/stalls/booth-lost-board";
import { StallMissing } from "@/components/mall-missing";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_LOST_COOKIE_NAME,
  lostTitlesForStall,
  parseBoothLost,
} from "@/lib/booth-lost";
import { stallLostPath } from "@/lib/paths";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type BoothLostPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: BoothLostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `Lost · ${stall.boothName}`,
    description: `Left behind on ${stall.boothName}. Sunglasses on the windbreaker pile. Not free. Not cork.`,
    path: stallLostPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallLostPage({
  params,
  searchParams,
}: BoothLostPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const titles = lostTitlesForStall(
    parseBoothLost(jar.get(BOOTH_LOST_COOKIE_NAME)?.value),
    stall.id,
  );

  return (
    <BoothLostBoard stall={stall} titles={titles} emptyTape={error === "empty"} />
  );
}
