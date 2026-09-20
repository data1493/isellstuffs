import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothMalletBoard } from "@/components/stalls/booth-mallet-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_MALLET_COOKIE_NAME,
  BOOTH_MALLET_PAPER_LINE,
  boothMalletFor,
  parseBoothMallet,
  stallMalletPath,
} from "@/lib/booth-mallet";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallMalletPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallMalletPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't have a mallet · ${stall.boothName}`,
    description: `${BOOTH_MALLET_PAPER_LINE} Tape the mallet note on ${stall.boothName}. Still a driveway. Still a stain.`,
    path: stallMalletPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallMalletPage({
  params,
  searchParams,
}: StallMalletPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothMallet(jar.get(BOOTH_MALLET_COOKIE_NAME)?.value);
  const current = boothMalletFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothMalletBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
