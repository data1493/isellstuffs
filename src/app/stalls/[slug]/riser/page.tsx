import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothRiserBoard } from "@/components/stalls/booth-riser-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_RISER_COOKIE_NAME,
  BOOTH_RISER_PAPER_LINE,
  boothRiserFor,
  parseBoothRiser,
  stallRiserPath,
} from "@/lib/booth-riser";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallRiserPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallRiserPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't have a riser · ${stall.boothName}`,
    description: `${BOOTH_RISER_PAPER_LINE} Tape the riser note on ${stall.boothName}. Still a crate. Still a skip.`,
    path: stallRiserPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallRiserPage({
  params,
  searchParams,
}: StallRiserPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothRiser(jar.get(BOOTH_RISER_COOKIE_NAME)?.value);
  const current = boothRiserFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothRiserBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
