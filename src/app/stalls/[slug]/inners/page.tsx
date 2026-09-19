import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothInnersBoard } from "@/components/stalls/booth-inners-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_INNERS_COOKIE_NAME,
  BOOTH_INNERS_PAPER_LINE,
  boothInnersFor,
  parseBoothInners,
  stallInnersPath,
} from "@/lib/booth-inners";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallInnersPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallInnersPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't have inners · ${stall.boothName}`,
    description: `${BOOTH_INNERS_PAPER_LINE} Tape the inners note on ${stall.boothName}. Grocery bag.`,
    path: stallInnersPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallInnersPage({
  params,
  searchParams,
}: StallInnersPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothInners(jar.get(BOOTH_INNERS_COOKIE_NAME)?.value);
  const current = boothInnersFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothInnersBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
