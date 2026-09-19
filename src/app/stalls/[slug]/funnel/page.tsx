import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothFunnelBoard } from "@/components/stalls/booth-funnel-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_FUNNEL_COOKIE_NAME,
  BOOTH_FUNNEL_PAPER_LINE,
  boothFunnelFor,
  parseBoothFunnel,
  stallFunnelPath,
} from "@/lib/booth-funnel";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallFunnelPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallFunnelPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't have a funnel · ${stall.boothName}`,
    description: `${BOOTH_FUNNEL_PAPER_LINE} Tape the funnel note on ${stall.boothName}. Still a drawer. Still a table.`,
    path: stallFunnelPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallFunnelPage({
  params,
  searchParams,
}: StallFunnelPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothFunnel(jar.get(BOOTH_FUNNEL_COOKIE_NAME)?.value);
  const current = boothFunnelFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothFunnelBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
