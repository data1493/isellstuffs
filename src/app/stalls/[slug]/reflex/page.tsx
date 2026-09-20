import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothReflexBoard } from "@/components/stalls/booth-reflex-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_REFLEX_COOKIE_NAME,
  BOOTH_REFLEX_PAPER_LINE,
  boothReflexFor,
  parseBoothReflex,
  stallReflexPath,
} from "@/lib/booth-reflex";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallReflexPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallReflexPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't have a reflex · ${stall.boothName}`,
    description: `${BOOTH_REFLEX_PAPER_LINE} Tape the reflex note on ${stall.boothName}. Still a crate. Still a skip.`,
    path: stallReflexPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallReflexPage({
  params,
  searchParams,
}: StallReflexPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothReflex(jar.get(BOOTH_REFLEX_COOKIE_NAME)?.value);
  const current = boothReflexFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothReflexBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
