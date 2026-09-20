import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothFlywheelBoard } from "@/components/stalls/booth-flywheel-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_FLYWHEEL_COOKIE_NAME,
  BOOTH_FLYWHEEL_PAPER_LINE,
  boothFlywheelFor,
  parseBoothFlywheel,
  stallFlywheelPath,
} from "@/lib/booth-flywheel";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallFlywheelPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallFlywheelPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't have a flywheel · ${stall.boothName}`,
    description: `${BOOTH_FLYWHEEL_PAPER_LINE} Tape the flywheel note on ${stall.boothName}. Still a crate.`,
    path: stallFlywheelPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallFlywheelPage({
  params,
  searchParams,
}: StallFlywheelPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothFlywheel(jar.get(BOOTH_FLYWHEEL_COOKIE_NAME)?.value);
  const current = boothFlywheelFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothFlywheelBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
