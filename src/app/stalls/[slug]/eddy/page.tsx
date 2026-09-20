import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothEddyBoard } from "@/components/stalls/booth-eddy-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_EDDY_COOKIE_NAME,
  BOOTH_EDDY_PAPER_LINE,
  boothEddyFor,
  parseBoothEddy,
  stallEddyPath,
} from "@/lib/booth-eddy";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallEddyPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallEddyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't have an eddy · ${stall.boothName}`,
    description: `${BOOTH_EDDY_PAPER_LINE} Tape the eddy note on ${stall.boothName}. Still a crate.`,
    path: stallEddyPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallEddyPage({
  params,
  searchParams,
}: StallEddyPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothEddy(jar.get(BOOTH_EDDY_COOKIE_NAME)?.value);
  const current = boothEddyFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothEddyBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
