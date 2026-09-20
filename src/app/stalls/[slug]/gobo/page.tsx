import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothGoboBoard } from "@/components/stalls/booth-gobo-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_GOBO_COOKIE_NAME,
  BOOTH_GOBO_PAPER_LINE,
  boothGoboFor,
  parseBoothGobo,
  stallGoboPath,
} from "@/lib/booth-gobo";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallGoboPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallGoboPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't have a gobo · ${stall.boothName}`,
    description: `${BOOTH_GOBO_PAPER_LINE} Tape the gobo note on ${stall.boothName}. Still a folder. Still a jewel case.`,
    path: stallGoboPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallGoboPage({
  params,
  searchParams,
}: StallGoboPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothGobo(jar.get(BOOTH_GOBO_COOKIE_NAME)?.value);
  const current = boothGoboFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothGoboBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
