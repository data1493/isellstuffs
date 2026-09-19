import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothPourBoard } from "@/components/stalls/booth-pour-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_POUR_COOKIE_NAME,
  BOOTH_POUR_PAPER_LINE,
  boothPourFor,
  parseBoothPour,
  stallPourPath,
} from "@/lib/booth-pour";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallPourPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallPourPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't pour · ${stall.boothName}`,
    description: `${BOOTH_POUR_PAPER_LINE} Tape the pour note on ${stall.boothName}. Heat is the microwave.`,
    path: stallPourPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallPourPage({
  params,
  searchParams,
}: StallPourPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothPour(jar.get(BOOTH_POUR_COOKIE_NAME)?.value);
  const current = boothPourFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothPourBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
