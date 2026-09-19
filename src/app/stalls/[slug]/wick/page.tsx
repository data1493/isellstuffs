import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothWickBoard } from "@/components/stalls/booth-wick-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_WICK_COOKIE_NAME,
  BOOTH_WICK_PAPER_LINE,
  boothWickFor,
  parseBoothWick,
  stallWickPath,
} from "@/lib/booth-wick";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallWickPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallWickPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't have a wick · ${stall.boothName}`,
    description: `${BOOTH_WICK_PAPER_LINE} Tape the wick note on ${stall.boothName}. Still a table.`,
    path: stallWickPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallWickPage({
  params,
  searchParams,
}: StallWickPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothWick(jar.get(BOOTH_WICK_COOKIE_NAME)?.value);
  const current = boothWickFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothWickBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
