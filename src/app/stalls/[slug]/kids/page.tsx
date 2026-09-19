import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothKidsBoard } from "@/components/stalls/booth-kids-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_KIDS_COOKIE_NAME,
  BOOTH_KIDS_PAPER_LINE,
  boothKidsFor,
  parseBoothKids,
} from "@/lib/booth-kids";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { stallKidsPath } from "@/lib/paths";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallKidsPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallKidsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `Kids touch it, you buy it · ${stall.boothName}`,
    description: `${BOOTH_KIDS_PAPER_LINE} Tape the little-hands note on ${stall.boothName}. Film stays no photos.`,
    path: stallKidsPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallKidsPage({
  params,
  searchParams,
}: StallKidsPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothKids(jar.get(BOOTH_KIDS_COOKIE_NAME)?.value);
  const current = boothKidsFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothKidsBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
