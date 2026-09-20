import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothWandBoard } from "@/components/stalls/booth-wand-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_WAND_COOKIE_NAME,
  BOOTH_WAND_PAPER_LINE,
  boothWandFor,
  parseBoothWand,
  stallWandPath,
} from "@/lib/booth-wand";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallWandPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallWandPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't have a wand · ${stall.boothName}`,
    description: `${BOOTH_WAND_PAPER_LINE} Tape the wand note on ${stall.boothName}. Still a crate. Still a skip.`,
    path: stallWandPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallWandPage({
  params,
  searchParams,
}: StallWandPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothWand(jar.get(BOOTH_WAND_COOKIE_NAME)?.value);
  const current = boothWandFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothWandBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
