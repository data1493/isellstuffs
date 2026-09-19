import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothTrivetBoard } from "@/components/stalls/booth-trivet-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_TRIVET_COOKIE_NAME,
  BOOTH_TRIVET_PAPER_LINE,
  boothTrivetFor,
  parseBoothTrivet,
  stallTrivetPath,
} from "@/lib/booth-trivet";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallTrivetPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallTrivetPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't have a trivet · ${stall.boothName}`,
    description: `${BOOTH_TRIVET_PAPER_LINE} Tape the trivet note on ${stall.boothName}. Still a drawer. Still a chip.`,
    path: stallTrivetPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallTrivetPage({
  params,
  searchParams,
}: StallTrivetPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothTrivet(jar.get(BOOTH_TRIVET_COOKIE_NAME)?.value);
  const current = boothTrivetFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothTrivetBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
