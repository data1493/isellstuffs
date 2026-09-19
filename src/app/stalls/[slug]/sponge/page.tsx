import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothSpongeBoard } from "@/components/stalls/booth-sponge-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_SPONGE_COOKIE_NAME,
  BOOTH_SPONGE_PAPER_LINE,
  boothSpongeFor,
  parseBoothSponge,
  stallSpongePath,
} from "@/lib/booth-sponge";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallSpongePageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallSpongePageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't have a sponge · ${stall.boothName}`,
    description: `${BOOTH_SPONGE_PAPER_LINE} Tape the sponge note on ${stall.boothName}. Still dishes. Still a hose.`,
    path: stallSpongePath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallSpongePage({
  params,
  searchParams,
}: StallSpongePageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothSponge(jar.get(BOOTH_SPONGE_COOKIE_NAME)?.value);
  const current = boothSpongeFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothSpongeBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
