import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothHarpBoard } from "@/components/stalls/booth-harp-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_HARP_COOKIE_NAME,
  BOOTH_HARP_PAPER_LINE,
  boothHarpFor,
  parseBoothHarp,
  stallHarpPath,
} from "@/lib/booth-harp";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallHarpPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallHarpPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't have a harp · ${stall.boothName}`,
    description: `${BOOTH_HARP_PAPER_LINE} Tape the harp note on ${stall.boothName}. The shade stays in the carton.`,
    path: stallHarpPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallHarpPage({
  params,
  searchParams,
}: StallHarpPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothHarp(jar.get(BOOTH_HARP_COOKIE_NAME)?.value);
  const current = boothHarpFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothHarpBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
