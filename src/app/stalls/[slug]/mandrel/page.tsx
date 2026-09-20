import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothMandrelBoard } from "@/components/stalls/booth-mandrel-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_MANDREL_COOKIE_NAME,
  BOOTH_MANDREL_PAPER_LINE,
  boothMandrelFor,
  parseBoothMandrel,
  stallMandrelPath,
} from "@/lib/booth-mandrel";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallMandrelPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallMandrelPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't have a mandrel · ${stall.boothName}`,
    description: `${BOOTH_MANDREL_PAPER_LINE} Tape the mandrel note on ${stall.boothName}. Still a table.`,
    path: stallMandrelPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallMandrelPage({
  params,
  searchParams,
}: StallMandrelPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothMandrel(jar.get(BOOTH_MANDREL_COOKIE_NAME)?.value);
  const current = boothMandrelFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothMandrelBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
