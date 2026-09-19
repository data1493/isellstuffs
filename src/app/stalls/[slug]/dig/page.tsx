import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothDigBoard } from "@/components/stalls/booth-dig-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_DIG_COOKIE_NAME,
  BOOTH_DIG_PAPER_LINE,
  boothDigFor,
  parseBoothDig,
  stallDigPath,
} from "@/lib/booth-dig";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallDigPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallDigPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `Don't dig under · ${stall.boothName}`,
    description: `${BOOTH_DIG_PAPER_LINE} Tape the gravel note on ${stall.boothName}. Ask what's on the table.`,
    path: stallDigPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallDigPage({
  params,
  searchParams,
}: StallDigPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothDig(jar.get(BOOTH_DIG_COOKIE_NAME)?.value);
  const current = boothDigFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothDigBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
