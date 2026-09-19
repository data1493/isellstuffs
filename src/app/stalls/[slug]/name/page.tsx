import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothNameBoard } from "@/components/stalls/booth-name-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_NAME_COOKIE_NAME,
  BOOTH_NAME_PAPER_LINE,
  boothNameFor,
  parseBoothName,
  stallNamePath,
} from "@/lib/booth-name";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallNamePageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallNamePageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I will not name them · ${stall.boothName}`,
    description: `${BOOTH_NAME_PAPER_LINE} Tape the name note on ${stall.boothName}. Sleeve is the bag.`,
    path: stallNamePath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallNamePage({
  params,
  searchParams,
}: StallNamePageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothName(jar.get(BOOTH_NAME_COOKIE_NAME)?.value);
  const current = boothNameFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothNameBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
