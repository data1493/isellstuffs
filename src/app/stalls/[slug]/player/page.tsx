import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothPlayerBoard } from "@/components/stalls/booth-player-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_PLAYER_COOKIE_NAME,
  BOOTH_PLAYER_PAPER_LINE,
  boothPlayerFor,
  parseBoothPlayer,
  stallPlayerPath,
} from "@/lib/booth-player";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallPlayerPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallPlayerPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't have a player · ${stall.boothName}`,
    description: `${BOOTH_PLAYER_PAPER_LINE} Tape the player note on ${stall.boothName}. Still Sharpie. Still a table.`,
    path: stallPlayerPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallPlayerPage({
  params,
  searchParams,
}: StallPlayerPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothPlayer(jar.get(BOOTH_PLAYER_COOKIE_NAME)?.value);
  const current = boothPlayerFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothPlayerBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
