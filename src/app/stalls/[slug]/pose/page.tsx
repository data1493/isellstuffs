import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothPoseBoard } from "@/components/stalls/booth-pose-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_POSE_COOKIE_NAME,
  BOOTH_POSE_PAPER_LINE,
  boothPoseFor,
  parseBoothPose,
  stallPosePath,
} from "@/lib/booth-pose";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallPosePageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallPosePageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `Nothing with a lookbook · ${stall.boothName}`,
    description: `${BOOTH_POSE_PAPER_LINE} Tape the lookbook note on ${stall.boothName}. Film is the tags.`,
    path: stallPosePath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallPosePage({
  params,
  searchParams,
}: StallPosePageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothPose(jar.get(BOOTH_POSE_COOKIE_NAME)?.value);
  const current = boothPoseFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothPoseBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
