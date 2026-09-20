import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothPlumbBoard } from "@/components/stalls/booth-plumb-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_PLUMB_COOKIE_NAME,
  BOOTH_PLUMB_PAPER_LINE,
  boothPlumbFor,
  parseBoothPlumb,
  stallPlumbPath,
} from "@/lib/booth-plumb";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallPlumbPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallPlumbPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't have a plumb · ${stall.boothName}`,
    description: `${BOOTH_PLUMB_PAPER_LINE} Tape the plumb note on ${stall.boothName}. Still a crack. Still a stain.`,
    path: stallPlumbPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallPlumbPage({
  params,
  searchParams,
}: StallPlumbPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothPlumb(jar.get(BOOTH_PLUMB_COOKIE_NAME)?.value);
  const current = boothPlumbFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothPlumbBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
