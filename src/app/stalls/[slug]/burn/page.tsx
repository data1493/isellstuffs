import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothBurnBoard } from "@/components/stalls/booth-burn-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_BURN_COOKIE_NAME,
  BOOTH_BURN_PAPER_LINE,
  boothBurnFor,
  parseBoothBurn,
  stallBurnPath,
} from "@/lib/booth-burn";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallBurnPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallBurnPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't burn a disc · ${stall.boothName}`,
    description: `${BOOTH_BURN_PAPER_LINE} Tape the burn note on ${stall.boothName}. Stick is no email.`,
    path: stallBurnPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallBurnPage({
  params,
  searchParams,
}: StallBurnPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothBurn(jar.get(BOOTH_BURN_COOKIE_NAME)?.value);
  const current = boothBurnFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothBurnBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
