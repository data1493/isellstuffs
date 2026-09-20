import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothTweezersBoard } from "@/components/stalls/booth-tweezers-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_TWEEZERS_COOKIE_NAME,
  BOOTH_TWEEZERS_PAPER_LINE,
  boothTweezersFor,
  parseBoothTweezers,
  stallTweezersPath,
} from "@/lib/booth-tweezers";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallTweezersPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallTweezersPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't have tweezers · ${stall.boothName}`,
    description: `${BOOTH_TWEEZERS_PAPER_LINE} Tape the tweezers note on ${stall.boothName}. Still a driveway. Still a crack.`,
    path: stallTweezersPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallTweezersPage({
  params,
  searchParams,
}: StallTweezersPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothTweezers(jar.get(BOOTH_TWEEZERS_COOKIE_NAME)?.value);
  const current = boothTweezersFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothTweezersBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
