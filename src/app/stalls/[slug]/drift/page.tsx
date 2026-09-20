import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothDriftBoard } from "@/components/stalls/booth-drift-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_DRIFT_COOKIE_NAME,
  BOOTH_DRIFT_PAPER_LINE,
  boothDriftFor,
  parseBoothDrift,
  stallDriftPath,
} from "@/lib/booth-drift";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallDriftPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallDriftPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't have a drift · ${stall.boothName}`,
    description: `${BOOTH_DRIFT_PAPER_LINE} Tape the drift note on ${stall.boothName}. Still a driveway.`,
    path: stallDriftPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallDriftPage({
  params,
  searchParams,
}: StallDriftPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothDrift(jar.get(BOOTH_DRIFT_COOKIE_NAME)?.value);
  const current = boothDriftFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothDriftBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
