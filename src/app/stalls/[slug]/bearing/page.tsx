import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothBearingBoard } from "@/components/stalls/booth-bearing-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_BEARING_COOKIE_NAME,
  BOOTH_BEARING_PAPER_LINE,
  boothBearingFor,
  parseBoothBearing,
  stallBearingPath,
} from "@/lib/booth-bearing";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallBearingPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallBearingPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't have a bearing · ${stall.boothName}`,
    description: `${BOOTH_BEARING_PAPER_LINE} Tape the bearing note on ${stall.boothName}. Still a crate. Still a skip.`,
    path: stallBearingPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallBearingPage({
  params,
  searchParams,
}: StallBearingPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothBearing(jar.get(BOOTH_BEARING_COOKIE_NAME)?.value);
  const current = boothBearingFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothBearingBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
