import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothFoilBoard } from "@/components/stalls/booth-foil-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_FOIL_COOKIE_NAME,
  BOOTH_FOIL_PAPER_LINE,
  boothFoilFor,
  parseBoothFoil,
  stallFoilPath,
} from "@/lib/booth-foil";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallFoilPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallFoilPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't have foil · ${stall.boothName}`,
    description: `${BOOTH_FOIL_PAPER_LINE} Tape the foil note on ${stall.boothName}. Drawer only.`,
    path: stallFoilPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallFoilPage({
  params,
  searchParams,
}: StallFoilPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothFoil(jar.get(BOOTH_FOIL_COOKIE_NAME)?.value);
  const current = boothFoilFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothFoilBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
