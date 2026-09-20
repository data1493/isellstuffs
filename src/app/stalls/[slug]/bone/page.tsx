import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothBoneBoard } from "@/components/stalls/booth-bone-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_BONE_COOKIE_NAME,
  BOOTH_BONE_PAPER_LINE,
  boothBoneFor,
  parseBoothBone,
  stallBonePath,
} from "@/lib/booth-bone";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallBonePageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallBonePageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't have a bone · ${stall.boothName}`,
    description: `${BOOTH_BONE_PAPER_LINE} Tape the bone note on ${stall.boothName}. Still a driveway. Still a grocery bag.`,
    path: stallBonePath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallBonePage({
  params,
  searchParams,
}: StallBonePageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothBone(jar.get(BOOTH_BONE_COOKIE_NAME)?.value);
  const current = boothBoneFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothBoneBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
