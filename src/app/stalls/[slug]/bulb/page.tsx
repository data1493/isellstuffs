import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothBulbBoard } from "@/components/stalls/booth-bulb-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_BULB_COOKIE_NAME,
  BOOTH_BULB_PAPER_LINE,
  boothBulbFor,
  parseBoothBulb,
  stallBulbPath,
} from "@/lib/booth-bulb";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallBulbPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallBulbPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't have a bulb · ${stall.boothName}`,
    description: `${BOOTH_BULB_PAPER_LINE} Tape the bulb note on ${stall.boothName}. Twist is the neck.`,
    path: stallBulbPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallBulbPage({
  params,
  searchParams,
}: StallBulbPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothBulb(jar.get(BOOTH_BULB_COOKIE_NAME)?.value);
  const current = boothBulbFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothBulbBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
