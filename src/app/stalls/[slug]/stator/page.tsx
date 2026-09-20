import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothStatorBoard } from "@/components/stalls/booth-stator-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_STATOR_COOKIE_NAME,
  BOOTH_STATOR_PAPER_LINE,
  boothStatorFor,
  parseBoothStator,
  stallStatorPath,
} from "@/lib/booth-stator";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallStatorPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallStatorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't have a stator · ${stall.boothName}`,
    description: `${BOOTH_STATOR_PAPER_LINE} Tape the stator note on ${stall.boothName}. Still a crate.`,
    path: stallStatorPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallStatorPage({
  params,
  searchParams,
}: StallStatorPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothStator(jar.get(BOOTH_STATOR_COOKIE_NAME)?.value);
  const current = boothStatorFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothStatorBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
