import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothLastBoard } from "@/components/stalls/booth-last-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_LAST_COOKIE_NAME,
  BOOTH_LAST_PAPER_LINE,
  boothLastFor,
  parseBoothLast,
  stallLastPath,
} from "@/lib/booth-last";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallLastPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallLastPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't have a last · ${stall.boothName}`,
    description: `${BOOTH_LAST_PAPER_LINE} Tape the last note on ${stall.boothName}. Still a table.`,
    path: stallLastPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallLastPage({
  params,
  searchParams,
}: StallLastPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothLast(jar.get(BOOTH_LAST_COOKIE_NAME)?.value);
  const current = boothLastFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothLastBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
