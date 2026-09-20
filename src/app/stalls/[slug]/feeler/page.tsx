import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothFeelerBoard } from "@/components/stalls/booth-feeler-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_FEELER_COOKIE_NAME,
  BOOTH_FEELER_PAPER_LINE,
  boothFeelerFor,
  parseBoothFeeler,
  stallFeelerPath,
} from "@/lib/booth-feeler";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallFeelerPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallFeelerPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't have a feeler · ${stall.boothName}`,
    description: `${BOOTH_FEELER_PAPER_LINE} Tape the feeler note on ${stall.boothName}. Still a crack. Still a stain.`,
    path: stallFeelerPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallFeelerPage({
  params,
  searchParams,
}: StallFeelerPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothFeeler(jar.get(BOOTH_FEELER_COOKIE_NAME)?.value);
  const current = boothFeelerFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothFeelerBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
