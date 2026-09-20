import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothFumeBoard } from "@/components/stalls/booth-fume-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_FUME_COOKIE_NAME,
  BOOTH_FUME_PAPER_LINE,
  boothFumeFor,
  parseBoothFume,
  stallFumePath,
} from "@/lib/booth-fume";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallFumePageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallFumePageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't have a fume · ${stall.boothName}`,
    description: `${BOOTH_FUME_PAPER_LINE} Tape the fume note on ${stall.boothName}. Still a driveway. Still no bench.`,
    path: stallFumePath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallFumePage({
  params,
  searchParams,
}: StallFumePageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothFume(jar.get(BOOTH_FUME_COOKIE_NAME)?.value);
  const current = boothFumeFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothFumeBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
