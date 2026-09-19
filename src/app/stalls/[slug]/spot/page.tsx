import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { MovedSpotBoard } from "@/components/stalls/moved-spot-board";
import { stallBySlug } from "@/lib/commerce";
import {
  MOVED_SPOT_COOKIE_NAME,
  MOVED_SPOT_PAPER_LINE,
  movedSpotFor,
  parseMovedSpot,
} from "@/lib/moved-spot";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { stallSpotPath } from "@/lib/paths";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallSpotPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallSpotPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `Moved two spots · ${stall.boothName}`,
    description: `${MOVED_SPOT_PAPER_LINE} Tape the new gravel on ${stall.boothName}. Not a seventh stall. Not new hours.`,
    path: stallSpotPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallSpotPage({
  params,
  searchParams,
}: StallSpotPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseMovedSpot(jar.get(MOVED_SPOT_COOKIE_NAME)?.value);
  const current = movedSpotFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <MovedSpotBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
