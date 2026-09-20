import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothPonyBoard } from "@/components/stalls/booth-pony-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_PONY_COOKIE_NAME,
  BOOTH_PONY_PAPER_LINE,
  boothPonyFor,
  parseBoothPony,
  stallPonyPath,
} from "@/lib/booth-pony";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallPonyPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallPonyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't have a pony · ${stall.boothName}`,
    description: `${BOOTH_PONY_PAPER_LINE} Tape the pony note on ${stall.boothName}. Still a closet.`,
    path: stallPonyPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallPonyPage({
  params,
  searchParams,
}: StallPonyPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothPony(jar.get(BOOTH_PONY_COOKIE_NAME)?.value);
  const current = boothPonyFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothPonyBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
