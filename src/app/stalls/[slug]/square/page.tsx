import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothSquareBoard } from "@/components/stalls/booth-square-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_SQUARE_COOKIE_NAME,
  BOOTH_SQUARE_PAPER_LINE,
  boothSquareFor,
  parseBoothSquare,
  stallSquarePath,
} from "@/lib/booth-square";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallSquarePageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallSquarePageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't have a square · ${stall.boothName}`,
    description: `${BOOTH_SQUARE_PAPER_LINE} Tape the square note on ${stall.boothName}. Still a table.`,
    path: stallSquarePath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallSquarePage({
  params,
  searchParams,
}: StallSquarePageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothSquare(jar.get(BOOTH_SQUARE_COOKIE_NAME)?.value);
  const current = boothSquareFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothSquareBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
