import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothPlinthBoard } from "@/components/stalls/booth-plinth-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_PLINTH_COOKIE_NAME,
  BOOTH_PLINTH_PAPER_LINE,
  boothPlinthFor,
  parseBoothPlinth,
  stallPlinthPath,
} from "@/lib/booth-plinth";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallPlinthPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallPlinthPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't have a plinth · ${stall.boothName}`,
    description: `${BOOTH_PLINTH_PAPER_LINE} Tape the plinth note on ${stall.boothName}. Still a crate. Still a skip.`,
    path: stallPlinthPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallPlinthPage({
  params,
  searchParams,
}: StallPlinthPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothPlinth(jar.get(BOOTH_PLINTH_COOKIE_NAME)?.value);
  const current = boothPlinthFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothPlinthBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
