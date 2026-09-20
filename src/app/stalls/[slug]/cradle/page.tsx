import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothCradleBoard } from "@/components/stalls/booth-cradle-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_CRADLE_COOKIE_NAME,
  BOOTH_CRADLE_PAPER_LINE,
  boothCradleFor,
  parseBoothCradle,
  stallCradlePath,
} from "@/lib/booth-cradle";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallCradlePageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallCradlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't have a cradle · ${stall.boothName}`,
    description: `${BOOTH_CRADLE_PAPER_LINE} Tape the cradle note on ${stall.boothName}. Still a crate. Still a skip.`,
    path: stallCradlePath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallCradlePage({
  params,
  searchParams,
}: StallCradlePageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothCradle(jar.get(BOOTH_CRADLE_COOKIE_NAME)?.value);
  const current = boothCradleFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothCradleBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
