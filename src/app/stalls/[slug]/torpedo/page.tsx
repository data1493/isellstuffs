import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothTorpedoBoard } from "@/components/stalls/booth-torpedo-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_TORPEDO_COOKIE_NAME,
  BOOTH_TORPEDO_PAPER_LINE,
  boothTorpedoFor,
  parseBoothTorpedo,
  stallTorpedoPath,
} from "@/lib/booth-torpedo";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallTorpedoPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallTorpedoPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't have a torpedo · ${stall.boothName}`,
    description: `${BOOTH_TORPEDO_PAPER_LINE} Tape the torpedo note on ${stall.boothName}. Still a crack. Still a stain.`,
    path: stallTorpedoPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallTorpedoPage({
  params,
  searchParams,
}: StallTorpedoPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothTorpedo(jar.get(BOOTH_TORPEDO_COOKIE_NAME)?.value);
  const current = boothTorpedoFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothTorpedoBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
