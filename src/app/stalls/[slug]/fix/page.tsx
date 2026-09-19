import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothFixBoard } from "@/components/stalls/booth-fix-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_FIX_COOKIE_NAME,
  BOOTH_FIX_PAPER_LINE,
  boothFixFor,
  parseBoothFix,
  stallFixPath,
} from "@/lib/booth-fix";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallFixPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallFixPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't fix · ${stall.boothName}`,
    description: `${BOOTH_FIX_PAPER_LINE} Tape the no-repair note on ${stall.boothName}. The tote still bags it.`,
    path: stallFixPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallFixPage({
  params,
  searchParams,
}: StallFixPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothFix(jar.get(BOOTH_FIX_COOKIE_NAME)?.value);
  const current = boothFixFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothFixBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
