import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothPolyBoard } from "@/components/stalls/booth-poly-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_POLY_COOKIE_NAME,
  BOOTH_POLY_PAPER_LINE,
  boothPolyFor,
  parseBoothPoly,
} from "@/lib/booth-poly";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { stallPolyPath } from "@/lib/paths";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallPolyPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallPolyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `Keep the poly on · ${stall.boothName}`,
    description: `${BOOTH_POLY_PAPER_LINE} Tape the crate note on ${stall.boothName}. Ask stays one sleeve.`,
    path: stallPolyPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallPolyPage({
  params,
  searchParams,
}: StallPolyPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothPoly(jar.get(BOOTH_POLY_COOKIE_NAME)?.value);
  const current = boothPolyFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothPolyBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
