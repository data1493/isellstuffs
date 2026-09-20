import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothRicerBoard } from "@/components/stalls/booth-ricer-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_RICER_COOKIE_NAME,
  BOOTH_RICER_PAPER_LINE,
  boothRicerFor,
  parseBoothRicer,
  stallRicerPath,
} from "@/lib/booth-ricer";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallRicerPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallRicerPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't have a ricer · ${stall.boothName}`,
    description: `${BOOTH_RICER_PAPER_LINE} Tape the ricer note on ${stall.boothName}. Still a drawer.`,
    path: stallRicerPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallRicerPage({
  params,
  searchParams,
}: StallRicerPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothRicer(jar.get(BOOTH_RICER_COOKIE_NAME)?.value);
  const current = boothRicerFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothRicerBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
