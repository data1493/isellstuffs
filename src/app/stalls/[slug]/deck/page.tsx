import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothDeckBoard } from "@/components/stalls/booth-deck-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_DECK_COOKIE_NAME,
  BOOTH_DECK_PAPER_LINE,
  boothDeckFor,
  parseBoothDeck,
  stallDeckPath,
} from "@/lib/booth-deck";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallDeckPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallDeckPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't have a deck · ${stall.boothName}`,
    description: `${BOOTH_DECK_PAPER_LINE} Tape the deck note on ${stall.boothName}. Plays is I already spun it.`,
    path: stallDeckPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallDeckPage({
  params,
  searchParams,
}: StallDeckPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothDeck(jar.get(BOOTH_DECK_COOKIE_NAME)?.value);
  const current = boothDeckFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothDeckBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
