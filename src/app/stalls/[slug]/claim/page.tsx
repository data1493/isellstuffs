import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothClaimBoard } from "@/components/stalls/booth-claim-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_CLAIM_COOKIE_NAME,
  BOOTH_CLAIM_PAPER_LINE,
  boothClaimFor,
  parseBoothClaim,
  stallClaimPath,
} from "@/lib/booth-claim";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallClaimPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallClaimPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't warranty · ${stall.boothName}`,
    description: `${BOOTH_CLAIM_PAPER_LINE} Tape the claim note on ${stall.boothName}. Fix is no solder.`,
    path: stallClaimPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallClaimPage({
  params,
  searchParams,
}: StallClaimPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothClaim(jar.get(BOOTH_CLAIM_COOKIE_NAME)?.value);
  const current = boothClaimFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothClaimBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
