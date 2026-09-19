import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothCoverBoard } from "@/components/stalls/booth-cover-board";
import {
  BOOTH_COVER_COOKIE_NAME,
  BOOTH_COVER_PAPER_LINE,
  boothCoverFor,
  coverSitterFor,
  parseBoothCover,
} from "@/lib/booth-cover";
import { stallBySlug } from "@/lib/commerce";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { stallCoverPath } from "@/lib/paths";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallCoverPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallCoverPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `Neighbor is sitting · ${stall.boothName}`,
    description: `${BOOTH_COVER_PAPER_LINE} Tape who is covering ${stall.boothName}. Not lunch. Not a watch.`,
    path: stallCoverPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallCoverPage({
  params,
  searchParams,
}: StallCoverPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothCover(jar.get(BOOTH_COVER_COOKIE_NAME)?.value);
  const current = boothCoverFor(stall.id, map);
  const sitter = coverSitterFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothCoverBoard
      stall={stall}
      map={map}
      current={current}
      sitter={sitter}
      packed={packed}
      emptyTape={error === "empty"}
      selfTape={error === "self"}
    />
  );
}
