import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothStropBoard } from "@/components/stalls/booth-strop-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_STROP_COOKIE_NAME,
  BOOTH_STROP_PAPER_LINE,
  boothStropFor,
  parseBoothStrop,
  stallStropPath,
} from "@/lib/booth-strop";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallStropPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallStropPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't have a strop · ${stall.boothName}`,
    description: `${BOOTH_STROP_PAPER_LINE} Tape the strop note on ${stall.boothName}. Still a crate. Still a skip.`,
    path: stallStropPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallStropPage({
  params,
  searchParams,
}: StallStropPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothStrop(jar.get(BOOTH_STROP_COOKIE_NAME)?.value);
  const current = boothStropFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothStropBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
