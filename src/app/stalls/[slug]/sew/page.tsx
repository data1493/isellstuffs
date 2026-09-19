import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothSewBoard } from "@/components/stalls/booth-sew-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_SEW_COOKIE_NAME,
  BOOTH_SEW_PAPER_LINE,
  boothSewFor,
  parseBoothSew,
  stallSewPath,
} from "@/lib/booth-sew";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallSewPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallSewPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't sew · ${stall.boothName}`,
    description: `${BOOTH_SEW_PAPER_LINE} Tape the sew note on ${stall.boothName}. Wash is laundry paper.`,
    path: stallSewPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallSewPage({
  params,
  searchParams,
}: StallSewPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothSew(jar.get(BOOTH_SEW_COOKIE_NAME)?.value);
  const current = boothSewFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothSewBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
