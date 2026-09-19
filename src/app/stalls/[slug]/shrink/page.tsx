import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothShrinkBoard } from "@/components/stalls/booth-shrink-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_SHRINK_COOKIE_NAME,
  BOOTH_SHRINK_PAPER_LINE,
  boothShrinkFor,
  parseBoothShrink,
  stallShrinkPath,
} from "@/lib/booth-shrink";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallShrinkPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallShrinkPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't shrink-wrap · ${stall.boothName}`,
    description: `${BOOTH_SHRINK_PAPER_LINE} Tape the shrink note on ${stall.boothName}. Poly stays if it is on.`,
    path: stallShrinkPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallShrinkPage({
  params,
  searchParams,
}: StallShrinkPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothShrink(jar.get(BOOTH_SHRINK_COOKIE_NAME)?.value);
  const current = boothShrinkFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothShrinkBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
