import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothChalkBoard } from "@/components/stalls/booth-chalk-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_CHALK_COOKIE_NAME,
  BOOTH_CHALK_PAPER_LINE,
  boothChalkFor,
  parseBoothChalk,
  stallChalkPath,
} from "@/lib/booth-chalk";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallChalkPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallChalkPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't have chalk · ${stall.boothName}`,
    description: `${BOOTH_CHALK_PAPER_LINE} Tape the chalk note on ${stall.boothName}. Still a season. Still no lookbook.`,
    path: stallChalkPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallChalkPage({
  params,
  searchParams,
}: StallChalkPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothChalk(jar.get(BOOTH_CHALK_COOKIE_NAME)?.value);
  const current = boothChalkFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothChalkBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
