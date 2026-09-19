import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothClampBoard } from "@/components/stalls/booth-clamp-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_CLAMP_COOKIE_NAME,
  BOOTH_CLAMP_PAPER_LINE,
  boothClampFor,
  parseBoothClamp,
  stallClampPath,
} from "@/lib/booth-clamp";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallClampPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallClampPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't have a clamp · ${stall.boothName}`,
    description: `${BOOTH_CLAMP_PAPER_LINE} Tape the clamp note on ${stall.boothName}. Still a folding table.`,
    path: stallClampPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallClampPage({
  params,
  searchParams,
}: StallClampPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothClamp(jar.get(BOOTH_CLAMP_COOKIE_NAME)?.value);
  const current = boothClampFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothClampBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
