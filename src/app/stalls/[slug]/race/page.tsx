import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothRaceBoard } from "@/components/stalls/booth-race-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_RACE_COOKIE_NAME,
  BOOTH_RACE_PAPER_LINE,
  boothRaceFor,
  parseBoothRace,
  stallRacePath,
} from "@/lib/booth-race";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallRacePageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallRacePageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't have a race · ${stall.boothName}`,
    description: `${BOOTH_RACE_PAPER_LINE} Tape the race note on ${stall.boothName}. Still a crate.`,
    path: stallRacePath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallRacePage({
  params,
  searchParams,
}: StallRacePageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothRace(jar.get(BOOTH_RACE_COOKIE_NAME)?.value);
  const current = boothRaceFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothRaceBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
