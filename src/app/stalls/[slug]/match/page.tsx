import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothMatchBoard } from "@/components/stalls/booth-match-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_MATCH_COOKIE_NAME,
  BOOTH_MATCH_PAPER_LINE,
  boothMatchFor,
  parseBoothMatch,
  stallMatchPath,
} from "@/lib/booth-match";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallMatchPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallMatchPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `Nothing matches · ${stall.boothName}`,
    description: `${BOOTH_MATCH_PAPER_LINE} Tape the match note on ${stall.boothName}. Fits is the lid.`,
    path: stallMatchPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallMatchPage({
  params,
  searchParams,
}: StallMatchPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothMatch(jar.get(BOOTH_MATCH_COOKIE_NAME)?.value);
  const current = boothMatchFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothMatchBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
