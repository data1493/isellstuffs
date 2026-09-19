import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothStackBoard } from "@/components/stalls/booth-stack-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_STACK_COOKIE_NAME,
  BOOTH_STACK_PAPER_LINE,
  boothStackFor,
  parseBoothStack,
  stallStackPath,
} from "@/lib/booth-stack";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallStackPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallStackPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `Don't unfold the pile · ${stall.boothName}`,
    description: `${BOOTH_STACK_PAPER_LINE} Tape the pile note on ${stall.boothName}. Ask is the LP flip.`,
    path: stallStackPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallStackPage({
  params,
  searchParams,
}: StallStackPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothStack(jar.get(BOOTH_STACK_COOKIE_NAME)?.value);
  const current = boothStackFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothStackBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
